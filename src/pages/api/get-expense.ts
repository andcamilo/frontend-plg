import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"
import { backendBaseUrl, backendEnv } from '@utils/env';

const getExpenseUrl = (id: string) => `${backendBaseUrl}/${backendEnv}/getExpense/${id}`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" })
  }

  console.log("joa entreeee")

  const { id } = req.query
  console.log("🚀 ~ handler ~ id:", id)

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Expense ID is required and must be a string" })
  }

  try {
    console.log(`Fetching expense details for ID: ${id}`)

    const url = getExpenseUrl(id)
    console.log("Fetching from URL:", url)

    const response = await axios.get(url)
    console.log("🚀 ~ handler ~ response:", response)

    return res.status(200).json(response.data)
  } catch (error) {
    console.error(`Error fetching expense with ID ${id}:`, error)

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Failed to fetch expense details"
      return res.status(error.response?.status || 500).json({ message: errorMessage })
    }

    return res.status(500).json({ message: "An unexpected error occurred" })
  }
}

