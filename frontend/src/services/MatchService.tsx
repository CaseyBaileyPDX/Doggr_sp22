import {httpClient} from "./HttpService";

export const Match = {
  async send(sender_id: string, receiver_id: string) {
    // This requests to localhost:9000/api/v1/messages with the 3 pieces of data
    console.log("Posting to /match with: ", sender_id, receiver_id)
    return httpClient.post("/match", { sender_id, receiver_id });
  },

  async getMatchesForUser(sender_id){
    let matches = await httpClient.post("/mymatches",{ sender_id});

    //let matches_obj = JSON.parse(matches.data);
    console.log("Got matches for user: ", matches.data);
    return matches.data;
  }


}



