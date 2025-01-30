import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.query;
  console.log("🚀 ~ userId:", userId)

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId parameter' });
  }

  try {
    // Use the userId from the query to build the request URL
    const response = await axios.get(
      `https://7hzt4b9tck.execute-api.us-east-1.amazonaws.com/dev/get-user-id/${userId}`
    );
    console.log("🚀 ~ response:", response)


    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({
      message: 'Failed to fetch user by ID',
      error: error.response?.data || error.message,
    });
  }
}
