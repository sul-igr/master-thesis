import type { PostApiPlansBody } from './postApiPlansBody';

export type PutApiPlansIdBody = Partial<PostApiPlansBody> & { active?: boolean };
