import { StreamChat } from "stream-chat"

import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET


if (!apiKey || !apiSecret) {
    console.log("stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData
    } catch (error) {
        console.log("eroor upseritng")

    }

};

export const generateStreamToken = (userId) =>{

    try {
        //ensure userId si a string

        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("error genratinfg stream Token " , error)
        
    }
};