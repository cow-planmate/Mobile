import {
  buildProfileImageUploadFile,
  MAX_PROFILE_IMAGE_SIZE_BYTES,
} from '../profileImage';

describe('buildProfileImageUploadFile', () => {
  it('allows a supported image and creates a fallback filename', () => {
    expect(
      buildProfileImageUploadFile({
        uri: 'content://images/profile',
        type: 'image/webp',
      }),
    ).toEqual({
      file: {
        uri: 'content://images/profile',
        type: 'image/webp',
        name: 'profile-image.webp',
      },
    });
  });

  it.each([
    [{ uri: 'content://images/profile', type: 'image/heic' }],
    [
      {
        uri: 'content://images/profile',
        type: 'image/png',
        fileSize: MAX_PROFILE_IMAGE_SIZE_BYTES + 1,
      },
    ],
  ])('rejects an unsupported or oversized file', asset => {
    expect(buildProfileImageUploadFile(asset)).toHaveProperty('error');
  });
});
