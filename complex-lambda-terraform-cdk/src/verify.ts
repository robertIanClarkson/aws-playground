import { z } from 'zod';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});
export const verify = (obj: object) => {
  return schema.safeParse(obj);
}