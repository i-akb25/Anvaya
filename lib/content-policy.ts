// This is a content-publication policy, not an authentication boundary.
// Draft teaching material must never become a production lesson or exam bank.
export function allowDraftPreview(environment:string|undefined,flag:string|undefined) {
  return environment === "development" && flag === "true";
}
export const draftPreviewEnabled = allowDraftPreview(process.env.NODE_ENV,process.env.NEXT_PUBLIC_ANVAYA_DRAFT_PREVIEW);
export function canPublishContent(status:string) {return status === "editorially-reviewed"}
