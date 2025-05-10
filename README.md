# Node.js
- It is a runtime of JavaScript(JS).
- Runtime: A program that runs another program.
- Runs JS in local machine.
- Build on C++
- Google V8 engine for compiling
- Used for: API, microservices, CLI, server side code

## Architecture
- Single threaded event-driven architecture
- Non-blocking I/O operation

## API
- HTTP methods
- Modules (HTTP, File System, URL, path)
- Callback, promises, async/await
- Server

### HTTP Methods
CRUD operation (Create, Read, Update, Delete)

1. GET (Read)
2. POST (Create)
3. PUT (Update)
4. DELETE (Delete)

## Node.js modules
1. File System
2. Path
3. URL
4. Event
5. HTTP

## Status
1. 200 - range => Success
2. 400 - range => Error by client
3. 500 - range => Error by server

## MongoDB
- Non-relational database
- Collection (Table)
- Document (Row)
- Field (Column)

- Schema (Data structure)
- Model

### MongoDB Tools
- Shell - Terminal
- Compass - Local GUI
- Atlas - Global URL

### MongoDB commands
1. mongosh : Connect with local MongoDB instance
2. show dbs : Show all database
3. cls : Clear screen
4. use <dbname> : Switch to a database Or create new DB if doesn't exist
5. show collections: Show list of collections (table) in a DB

### Query
**Create**
1. insertOne
 - db.<collectionName>.insertOne()
 - For e.g: db.users.insertOne({name:"John"})

2. insertMany
- db.<collectionName>.insertMany()
- For e.g: db.users.insertMany([{name:"Jerry"}, {name:"Tom"}])

**Read**
1. find()
- db.<collectionName>.find()
- For e.g: db.users.find()

2. find(<filterObject>)
- db.users.find({name:"John"})

**Update**
1. updateOne
- db.<collectionName>.updateOne()
- For e.g: db.users.updateOne({name:"Ram"} , {$set: {age: 35}})

**Delete**
1. deleteOne()
- db.<collectionName>.deleteOne()
- For e.g: db.users.deleteOne({name:"Ram"})

**Complex Filter**
1. $gt/$gte
- db.users.find({age: {$gt: 20}})

2. $lt/$lte
- db.users.find({age: {$lte: 20}})

3. $eq/$ne : equal/not equal

## Encryption
Hello -> asdfasgf : Encryption
asdfadsfasd -> Hello : Decryption

## Hashing
- One way encryption
Hello -> safdasdfasfdsdfg
Hello -> safdasdfasfdsdfg

## Salt
- Extra addition character added to hash
Hello -> 123456789safdasdfasfdsdfg
Hello -> 987654321iorpoitjwerptwje

## JSON web token JWT
- Create a unique token of auth (logged in) user.

- Header | Body | Signature
- asdfasdfasdf.asdfasdfasfasdfasfd.asdfgsadfasdfasdf

## Session Storage, Local Storage, Cookie
- Store the created token

1. Cookie: 
    - Can be stored in both server and browser
    - 4KB 
    - Available throughout the browser
    - Expiry date can be set
2. Session: 
    - Can be stored in browser only
    - 5MB
    - Available in only one tab
    - Expires on tab close
3. Local storage: 
    - Can be stored in browser only
    - 5MB to 10MB
    - Available throughout the browser
    - Never expires

1. Generate JWT token
2. Store JWT token in Cookie
3. Get the token from cookie
4. Verify the JWT token

## File upload
1. Get the file from form-data
2. Store the file temporarily
3. Upload the file in bucket
4. Get the file url from bucket
5. Store file url in the DBf

## Payment 
1. Gather required data for payment
    - User, amount, currency
2. Payment method integration (for e.g khalti)
3. Payment status - success/failure, transactionId
4. Update payment status/results


## Debugging
1. Root file (src/app.js)
2. Routes
3. Middleware
4. Controller
5. Service
6. Helper/util functions

## Semantic coding
1. Variables, constants, data types, param, args, fileName: Noun
2. Method, function: verb
