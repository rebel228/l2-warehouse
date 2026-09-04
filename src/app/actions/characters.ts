'use server';

export type State = {
  errors?: {
    name?: string[];
    class?: string[];
    userId?: string[];
  };
  message?: string | null;
};

export async function addCharacter(prevstate: State, formData: FormData): Promise<State> {
  console.log('📦 Character formData:', Array.from(formData.entries()));
  return { errors: {}, message: 'Character added successfully' };
}
