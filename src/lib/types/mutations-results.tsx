export type ActionResult<TErrors = undefined> =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      message: string;
      errors?: TErrors;
    };

export type ItemFieldErrors = {
  name?: string[];
  grade?: string[];
  type?: string[];
  enchant?: string[];
  ownerUserId?: string[];
  assignedId?: string[];
  holderId?: string[];
};

export type CharacterFieldErrors = {
  name?: string[];
  class?: string[];
  userId?: string[];
};
