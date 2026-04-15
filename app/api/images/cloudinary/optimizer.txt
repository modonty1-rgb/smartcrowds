export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const optimizeCloudinaryUrl = (data: CloudinaryUploadResult): CloudinaryUploadResult => {
  const url = new URL(data.secure_url);
  url.searchParams.set('f_auto', 'true');
  url.searchParams.set('q_auto', 'true');
  url.searchParams.set('w', '800');
  url.searchParams.set('c_scale', 'true');

  return {
    ...data,
    secure_url: url.toString(),
  };
};
