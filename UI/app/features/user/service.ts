import { getCurrentUserApi } from "./api";

export const getCurrentUserService = async () => {
  const res = await getCurrentUserApi();
  return res.data;
};
