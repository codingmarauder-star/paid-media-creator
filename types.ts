export enum LogStatus {
  INFO,
  SUCCESS,
  ERROR,
  LOADING,
}

export interface LogMessage {
  text: string;
  status: LogStatus;
  data?: any;
}

export interface Credentials {
  accessToken: string;
  adAccountId: string;
  pageId: string;
}