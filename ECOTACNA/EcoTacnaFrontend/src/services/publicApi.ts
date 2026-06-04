import { rucApi, RucLookupData } from "./rucApi";

export type RucLookupResponse = RucLookupData;

export const publicApi = {
  lookupRuc: async (ruc: string): Promise<RucLookupResponse> => {
    return rucApi.consultarRuc(ruc);
  },
};
