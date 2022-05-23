import {Match} from "../database/models/MatchHistory";

export const CreateMatch = async (req, res) => {

  const {
    sender_id,
    receiver_id
  } = req.body;

  Match.create({
    sender_id,
    receiver_id
  })
    .then(() => {
      console.log("Created Match");
      res.status(200)
        .json({message: "Created Match successfully"});
    })
    .catch((err) => {
      console.log('failed to create Match');
      console.log(err);
      res.status(500)
        .json({message: err});
    });
};
