// build.js
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const dependency_tree = require('dependency-tree');

async function buildProject() {
  // 1. First, clean the dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }

  // 2. Create necessary directories
  fs.mkdirSync('dist/src', { recursive: true });
  fs.mkdirSync('dist/dep', { recursive: true });

  // 3. Build source files with TypeScript (using child_process for simplicity)
  const { execSync } = require('child_process');
  execSync('tsc', { stdio: 'inherit' });

  // 4. Find all external dependencies
  const listDependencies = () => {
    const packageJson = require('./package.json');
    const dependencies = new Set();
    
    // Get all .ts files in src
    const sourceFiles = getAllFiles('./src', ['.ts', '.tsx'])
      .map(file => path.resolve(file));

    sourceFiles.forEach(file => {
      const deps = dependency_tree.toList({
        filename: file,
        directory: '.',
        filter: path => path.includes('node_modules'),
        detective: {
          es6: {
            mixedImports: true,
          },
        },
      });

      deps.forEach(dep => {
        // Extract the package name from the path
        const matches = dep.match(/node_modules\/([^/]+)/);
        if (matches && matches[1]) {
          const pkgName = matches[1].startsWith('@') 
            ? `${matches[1]}/${dep.split('/')[2]}`
            : matches[1];
          
          // Only include if it's a direct dependency
          if (packageJson.dependencies[pkgName]) {
            dependencies.add(pkgName);
          }
        }
      });
    });

    return Array.from(dependencies);
  };

  // 5. Bundle each dependency separately
  const deps = listDependencies();
  console.log('Found dependencies:', deps);

  for (const dep of deps) {
    console.log(`Bundling ${dep}...`);
    try {
      await esbuild.build({
        entryPoints: [`node_modules/${dep}`],
        bundle: true,
        platform: 'node',
        target: 'node18',
        outfile: `dist/dep/${dep.replace('/', '-')}.js`,
        format: 'cjs',
        external: deps.filter(d => d !== dep), // exclude other dependencies
        logLevel: 'info',
      });
    } catch (error) {
      console.error(`Error bundling ${dep}:`, error);
      process.exit(1);
    }
  }

  // 6. Generate path mappings for tsconfig
  const pathMappings = {};
  deps.forEach(dep => {
    pathMappings[dep] = [`./dist/dep/${dep.replace('/', '-')}`];
  });

  // 7. Update tsconfig with new path mappings
  const tsconfig = require('./tsconfig.json');
  tsconfig.compilerOptions.paths = pathMappings;
  fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
}

function getAllFiles(dir, extensions) {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  });

  return files;
}

buildProject().catch(console.error);
