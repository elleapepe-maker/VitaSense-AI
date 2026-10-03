// Creator-only access control. Premium features are reserved for the app creator.
export const CREATOR_EMAIL = "ellea.pepe@gmail.com";

export function isCreator(email?: string | null): boolean {
  return !!email && email.toLowerCase().trim() === CREATOR_EMAIL.toLowerCase();
}
