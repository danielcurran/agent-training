# Lab Spec \- Foundations of Data Transformation

## Track Info

| OS | `Ubuntu 22.04.5 LTS (Jammy Jellyfish)` |
| :---- | :---- |
| Image type | `Virtual Machine` |
| `MongoDB Version` | `8.0.5 Enterprise` |
| Type | Hosted (all tracks) |
| Language(s) | Basic MQL / JS |
| Lab config (eg. 3 node repl) | Single mongodb instance hosted locally `` `instruqt-mongodb-image:0.27 `` |
| Known dependencies | n/a |

## Lesson 1 \- Introduction to MongoDB Aggregation (no labs)

###### *Links*

- [Video script](https://docs.google.com/document/d/1KmW7l-Bg_0oPWqBNaOsrJGQZm-fm4mJZdwBpVgzFe4M/edit?tab=t.0)  
- [Content outline](https://docs.google.com/document/d/1aBErYRKLV9Q68CvU7SnvKCbj5MELzWbaDS-Gfy0uOYE/edit?tab=t.0)

###### *Overview*

- **No labs** for this lesson  
- When and why to use aggregation  
- Discusses common stages

## Lesson 2 \- Common Architectures: $match, $group, $project

###### *LOs*

* Understand the function of each stage in the $match, $unwind, $group, $project example pipeline and its purpose in the pipeline as a whole  
* Create a pipeline that makes use of $match, $group, and $project

###### *Links:*

* [video script](https://docs.google.com/document/d/16Iv44J6xnydqARGmlw4Vo1uDaVIVOYe5L6WoHbD88lk/edit?tab=t.0#heading=h.3ee8ip38nd1n)  
* [location in outline](https://docs.google.com/document/d/1aBErYRKLV9Q68CvU7SnvKCbj5MELzWbaDS-Gfy0uOYE/edit?tab=t.0#bookmark=id.jownjzxfcwl6)

### Exercise: Generating reports using match, group and project

| Pre conditions (collections present) | `online_bookstore.sales (new dataset)` |
| :---- | :---- |
| Post conditions (collections present) | `online_bookstore.sales` |
| Change to data | No |
| Indexes created | Yes (created during setup) |
| Tabs needed | mongosh | editor |

#### Executive Summary

In this challenge, learners will create an aggregation pipeline using the $match, $unwind, $group, and $project stages to generate a report showing the total revenue earned by each book genre in 2024\. Learners will be provided with the sample dataset, and they will need to construct the aggregation pipeline step by step to filter, deconstruct, group, and project the desired data.

```javascript
use("online_bookstore");

const matchStage = {
  $match: {
    date: {
      $gte: new Date("2024-01-01T00:00:00Z"),
      $lt: new Date("2025-01-01T00:00:00Z"),
    },
  },
};

const unwindStage = { $unwind: "$books" };

const groupStage = {
  $group: {
    _id: "$books.genre",
    totalRevenue: {
      $sum: "$books.price",
    },
  },
};

const projectStage = {
  $project: {
    _id: 0,
    genre: "$_id",
    totalRevenue: 1,
  },
};

const result = db.sales.aggregate([
  matchStage,
  unwindStage,
  groupStage,
  projectStage,
]);

printjson(result);
```

#### Steps

1. Update the `query.js` file by completing the aggregation pipeline such that it includes a `$match` stage to filter the documents based on a date range spanning one year  
2. Add an `$unwind` stage to the aggregation pipeline in `query.js` to deconstruct the `books` array within each `sales` document, resulting in a separate doc for each book sold  
3. Save and execute the pipeline up to this point using the MongoDB shell and examine the results.  
4. Append a `$group` stage to consolidate documents by the genre of each book, summing up the total revenue for each genre  
5. Finally, add a `$project` stage to rename the \_id field to `genre` and include the summed revenue field in the output. Save the changes to the `query.js` file  
   1. In instructions, a note will be added about potentially using `$out` to persist the results  
6. Using the mongosh tab, load the aggregation pipeline using the `load()` method and examine the results.

#### Success Criteria

1. An aggregation pipeline containing the \`$match\` and \`$unwind\` steps has been executed in the mongodb shell  
2. The final `query.js` file was updated with the appropriate match, unwind, group, and project stages and returns the expected output when executed.

## Lesson 3: Using the $sort and $limit stages

###### *LOs:*

* Understand the function of each stage in the $match, $sort, $limit example pipeline, and its purpose in the pipeline as a whole  
* Create a pipeline that makes use of $match, $sort, and $limit (end of badge lab)

###### *Links*

* [L3 - Using the $sort and $limit stages](https://docs.google.com/document/d/1R4P0rtIWPRs4p2N0HUz3WLvW9UVnp8ucd8wWz0gW_GQ/edit?usp=drive_link)  
* [Outline](https://docs.google.com/document/d/1aBErYRKLV9Q68CvU7SnvKCbj5MELzWbaDS-Gfy0uOYE/edit?tab=t.0#bookmark=id.nbpikmi9bzs4)

### Exercise: Using sort and limit refine pipelines

| Pre conditions (collections present) | `online_bookstore.reviews` |
| :---- | :---- |
| Post conditions (collections present) | `online_bookstore.reviews` |
| Change to data | No |
| Indexes created | Yes (created during setup) |
| Tabs needed | mongosh | editor |

#### Executive Summary

In this challenge, learners will complete an aggregation pipeline located within a `query.js` file. This pipeline should find the top-rated books based on the average customer rating from reviews that were left after the year 2017\. This lab has learners focus on using the $sort and $limit stages to sort the books by their average rating in descending order. Then learners will limit those results to just the top 10\. The $match stage, and the calculation of the average rating will be provided to the learner.

```javascript
use("online_bookstore");

const matchStage = { // provided
  $match: {
    timestamp: {
      $gt: new Date(2018, 0, 1),
    },
  },
};

const groupStage = {
  $group: {
    _id: "$book_id",
    averageRating: { $avg: "$rating" }, // field pre-populated
  },
};

const sortStage = {
  $sort: {
    averageRating: -1,
  },
};

const limitStage = { $limit: 10 };

const result = db.reviews.aggregate([
  matchStage,
  groupStage,
  sortStage,
  limitStage,
]);

printjson(result);
```

#### Steps

1. Using the pipeline defined in `query.js`, complete the `$group` stage in the `query.js` aggregation pipeline so that it calculates the average rating for each book by `book_id`  
   1. Match stage pre-populated  
   2. `averageRating` field pre-populated  
2. Save and execute the pipeline up to this point using the MongoDB shell and examine the results.  
3. Add a stage to `sort` the books by average rating in descending order  
4. Add a stage to `limit` the results to 10 documents, save the changes to the `query.js` file  
   1. In instructions, a note will be added about potentially using `$out` to persist the results  
5. Using the `mongosh` tab, execute the final pipeline using the `load()` method

#### Success Criteria

1. The partially-completed aggregation pipeline was updated with a `group` stage calculating the average rating for each book  
2. A sort stage was added to the aggregation pipeline to sort the books by average rating in descending order  
3. A limit stage was added to the aggregation pipeline to limit the results to 10 documents  
4. When executed, the `query.js` file returns the expected 10 documents

## Lesson 4: Working with the $lookup and $set stages

###### *LOs*

* Understand the function of the $lookup and $set stages  
* Create a pipeline that makes use of $lookup and set $stages 

###### *Links*

* [Video scripts](https://docs.google.com/document/d/1QM6cxpqAQ-IgJC_JtiDwntfG8YRgRwJfiRroqERRs-I/edit?tab=t.0)  
* [Outline](https://docs.google.com/document/d/1aBErYRKLV9Q68CvU7SnvKCbj5MELzWbaDS-Gfy0uOYE/edit?tab=t.0#bookmark=id.l8rbawa3b2jr)

### Exercise: Working with $lookup and $set

| Pre conditions (collections present) | `online_bookstore.customers online_bookstore.sales` |
| :---- | :---- |
| Change to data | No |
| Indexes created | Yes (created during setup) |
| Tabs needed | mongosh | editor |

#### Executive Summary

In this challenge, learners will complete an aggregation pipeline by adding a `$lookup`, and `$set` stage. The finished aggregation pipeline will be used to generate a marketing list of customers who have purchased children's books. Learners will be provided with the sample dataset, and they will need to complete the aggregation pipeline within the `pipeline.js` file. In this activity, learners are provided with an unsolved file that contains some code to start with. The aggregation pipeline will be declared, and there will be empty objects for each stage that needs to be added. The `$unwind` stage, `$match` stage, and `$project` stage will be provided outright. Additionally, the `$set` stage will have the structure of the stage laid out as a code comment to give learners a starting point.

```javascript
use("online_bookstore");

const lookupStage = {
  $lookup: {
    from: "customers",
    localField: "customer",
    foreignField: "_id",
    as: "customer_details",
  },
};

const unwindStage = { $unwind: { path: "$customer_details" } }; // provided

const setStage = { // skeleton for this stage will be provided as a code comment
  $set: {
    childrensBooks: {
      $filter: {
        input: "$books",
        as: "book",
        cond: { $eq: ["$$book.genre", "Children's literature"] },
      },
    },
  },
};

const matchStage = { // provided
  $match: {
    childrensBooks: { $ne: [] },
  },
};

const projectStage = { // provided
  $project: {
    _id: 0,
    customerName: {
      $concat: [
        "$customer_details.name.first",
        " ",
        "$customer_details.name.last",
      ],
    },
    email: "$customer_details.email",
    childrensBooks: "$childrensBooks.title",
  },
};

const result = db.sales.aggregate([
  lookupStage,
  unwindStage,
  setStage,
  matchStage,
  projectStage,
]);

printjson(result);

// TODO: add note about persisting to a collection for the reports

```

#### Pipeline breakdown

* The pipeline runs on the `sales` collection.  
* The `$lookup` stage is used to join data from the `customers` collection.  
* The `localField` in the `sales` collection is `customer`.  
* The `foreignField` in the `customers` collection is `_id`.  
* The result of the `$lookup` is stored in a new field called `customer_details`.  
* The `$unwind` stage is applied to the `customer_details` array.  
* A `$set` stage is used to filter books with the genre "Children's literature" into a new field called `childrensBooks`.  
* A `$match` stage is used to exclude documents without children's books.  
* Finally, a `$project` stage is used to reshape the output to include only the customer's name, email address, and titles of children's books purchased.

#### Steps:

1. Using the editor tab, open the `pipeline.js` file and add a `$lookup` stage as the first stage in the pipeline that joins data from the customer's collection with data in the `sales` collection based on a matching customer reference.  
2. Save and execute the pipeline up to this point using the MongoDB shell and examine the results.  
   1. `$lookup` and `$unwind` should be present  
3. Under the pre-populated unwind stage, add a `$set` stage to the pipeline that will add a new field called `childrensBooks` that includes only book titles with a genre of `"Children's literature"`.  
   1. The structure of this stage, including the field name and empty `$filter` object will be provided in the unsolved code as a comment to give learners a hint as to what to add  
   2. In instructions, a note will be added about potentially using `$out` to persist the book titles  
4. Save the changes to the `pipeline.js` file and use the mongosh tab to execute it with the `load()` method

#### Success Criteria

1. The aggregation  pipeline was executed after adding the `$lookup` stage to examine how the documents were transformed  
1. The `pipeline.js` file returns the expected documents when executed in `mongosh`, indicating that the correct aggregation pipeline stages were added to the partially completed pipeline.

## Lesson 5 \- Explain (no labs)

* No labs (mostly done in Atlas UI)

