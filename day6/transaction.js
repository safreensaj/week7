const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(
  "mongodb://127.0.0.1:27017/?replicaSet=rs0"
);

async function makePayment() {
  await client.connect();

  const db = client.db("studentService");
  const session = client.startSession();

  console.log("MongoDB Connected!");

  try {
    await session.withTransaction(async () => {

      // 1. Insert payment
      await db.collection("payments").insertOne({
        studentId: new ObjectId("6aeb47097844b567f7fbfed3"),
        amount: 26250,
        date: new Date()
      }, { session });

      console.log("Payment inserted!");

      // 2. Update student
      await db.collection("students").updateOne(
        { _id: new ObjectId("6aeb47097844b567f7fbfed3") },
        { $set: { feeStatus: "paid" } },
        { session }
      );

      console.log("Student status updated!");

    });

    console.log("Transaction completed!");

  } catch (error) {
    console.log("Transaction failed:", error);
  } finally {
    await session.endSession();
    await client.close();
  }
}

makePayment();