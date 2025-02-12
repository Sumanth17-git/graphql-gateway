const { ApolloServer, gql } = require("apollo-server");
const axios = require("axios");

// Set the FastAPI base URL. In Kubernetes, this should resolve to the FastAPI Service.
// You can override it via the FASTAPI_URL environment variable.
const FASTAPI_URL = process.env.FASTAPI_URL || "http://recommendation-api-service";

// Define GraphQL type definitions
const typeDefs = gql`
  type Recommendation {
    user_id: String!
    recommendations: [String!]!
  }

  type Query {
    getRecommendation(user_id: String!): Recommendation
    getAllRecommendations: [Recommendation!]!
  }

  type Mutation {
    addRecommendation(user_id: String!, category: String!): Recommendation
    removeRecommendation(user_id: String!, category: String!): Recommendation
  }
`;

// Define resolvers that call FastAPI endpoints via HTTP
const resolvers = {
  Query: {
    // Calls GET /get_recommendations/{user_id} on FastAPI
    async getRecommendation(_, { user_id }) {
      try {
        const response = await axios.get(
          `${FASTAPI_URL}/get_recommendations/${user_id}`
        );
        // Assuming FastAPI response is structured as:
        // { status: "success", message: "...", data: { user_id: "...", recommendations: [...] } }
        return response.data.data;
      } catch (error) {
        console.error("Error in getRecommendation:", error.message);
        throw new Error(error.response?.data?.detail || error.message);
      }
    },
    // Calls GET /get_all_recommendations/ on FastAPI
    async getAllRecommendations() {
      try {
        const response = await axios.get(`${FASTAPI_URL}/get_all_recommendations/`);
        return response.data.data;
      } catch (error) {
        console.error("Error in getAllRecommendations:", error.message);
        throw new Error(error.response?.data?.detail || error.message);
      }
    }
  },
  Mutation: {
    // Calls POST /add_recommendation/ on FastAPI
    async addRecommendation(_, { user_id, category }) {
      try {
        const response = await axios.post(`${FASTAPI_URL}/add_recommendation/`, {
          user_id,
          category
        });
        return response.data.data;
      } catch (error) {
        console.error("Error in addRecommendation:", error.message);
        throw new Error(error.response?.data?.detail || error.message);
      }
    },
    // Calls DELETE /remove_recommendation/{user_id}/{category} on FastAPI
    async removeRecommendation(_, { user_id, category }) {
      try {
        const response = await axios.delete(
          `${FASTAPI_URL}/remove_recommendation/${user_id}/${category}`
        );
        return response.data.data;
      } catch (error) {
        console.error("Error in removeRecommendation:", error.message);
        throw new Error(error.response?.data?.detail || error.message);
      }
    }
  }
};

// Create the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// Start the server
server
  .listen({ port: 4000 })
  .then(({ url }) => {
    console.log(`🚀 GraphQL Gateway ready at ${url}`);
  })
  .catch((err) => {
    console.error("Error starting Apollo Server:", err);
  });
