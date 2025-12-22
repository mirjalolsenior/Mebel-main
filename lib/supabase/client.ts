import { createBrowserClient } from "@supabase/ssr"

const createMockClient = () => ({
  from: (table: string) => {
    const mockQuery = {
      data: [],
      error: { message: "Supabase not configured" },

      select: (columns = "*") => ({
        ...mockQuery,
        order: (column: string, options?: { ascending?: boolean }) => ({
          ...mockQuery,
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
        }),
        limit: (count: number) => Promise.resolve({ data: [], error: null }),
        eq: (column: string, value: any) => ({
          ...mockQuery,
          order: (column: string, options?: { ascending?: boolean }) => Promise.resolve({ data: [], error: null }),
        }),
      }),

      insert: (values: any) =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured - insert operation failed" },
        }),

      update: (values: any) => ({
        eq: (column: string, value: any) =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured - update operation failed" },
          }),
      }),

      delete: () => ({
        neq: (column: string, value: any) =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured - delete operation failed" },
          }),
        eq: (column: string, value: any) =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured - delete operation failed" },
          }),
      }),
    }

    return mockQuery
  },
})

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables not found. Using mock client.")
    return createMockClient()
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

export const supabase = createClient()
