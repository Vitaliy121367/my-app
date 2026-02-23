type CommentType = {
  _id: string;
  text: string;
  fromUserId?: UserType | null;
  toRecordId?: RecordType | null;
  rating: number;
};