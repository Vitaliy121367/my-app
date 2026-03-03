type RecordType = {
  _id: string;
  platform: string;
  time: string;
  version: string;
  dateUpload: string;
  urlVideo: string;
  status: string;
  gameId: { name: string };
  userId: UserType | null;
};