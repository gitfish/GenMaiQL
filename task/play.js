const { generateFromSource } = require("../lib/generate.types");

const r = generateFromSource(`
    enum BlogStatus {
        ACTIVE
        INACTIVE
        PENDING_DELETION
    }

    interface Node {
        id: ID!
    }

    type Blog implements Node @model {
        id: ID!
        name: String!
        posts: [Post] @connection(keyName: "byBlog", fields: ["id"])
        status: BlogStatus
        boo: Boolean
        jubjub(foo: Int): Float
    }

    type Post implements Node @model @key(name: "byBlog", fields: ["blogID"]) {
        id: ID!
        title: String!
        blogID: ID!
        blog: Blog @connection(fields: ["blogID"])
        comments: [Comment] @connection(keyName: "byPost", fields: ["id"])
    }

    type Comment implements Node @model @key(name: "byPost", fields: ["postID", "content"]) {
        id: ID!
        postID: ID!
        post: Post @connection(fields: ["postID"])
        content: String!
    }
`);

console.log("-- Output");
console.log(r.content);
