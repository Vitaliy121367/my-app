type RecordType = {
  _id: string;
  platform: string;
  time: string;
  version: string;
  dateUpload: string;
  urlVideo: string;
  userId: UserType | null;
  gameId: GameType | null;
};