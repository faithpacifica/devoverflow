"use server";

import mongoose from "mongoose";

import Question, { IQuestionDoc } from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag, { ITagDoc } from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true, //only authorised users can ask questions
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );

    if (!question) {
      throw new Error("Failed to create question");
    }

    const tagIds: mongoose.Types.ObjectId[] = []; //taglar uchun bo'sh massiv yaratamiz. Types.ObjectId bu Mongoose ning maxsus turi bo'lib, u MongoDB ning ObjectId larini ifodalaydi va ular hujjatlarni noyob identifikatsiya qilish uchun ishlatiladi
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } }, //$regex bu regular expression,vazifasi bilan tag nomini qidiradi, ^ va $ belgilar bilan to'liq moslikni ta'minlaydi,
        //i bu case-insensitive qidiruv
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } }, //$setOnInsert - yangi tag yaratilganda name maydonini o'rnatadi,$inc - mavjud tag bo'lsa, uning questions maydonini 1 ga oshiradi
        { upsert: true, new: true, session } //upsert: agar mos keladigan hujjat topilmasa, yangi hujjat yaratadi,new: yangilangan yoki kiritilgan hujjatni qaytaradi
      );

      tagIds.push(existingTag._id); //tagIds massiviga tag ning _id sini qo'shamiz
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocuments, { session }); //TagQuestion kolleksiyasiga barcha tag-question hujjatlarini qo'shamiz

    await Question.findByIdAndUpdate(
      // question hujjatini yangilaymiz, unga tegishli tag larni qo'shamiz
      question._id, //qaysi question ni yangilash kerakligini aniqlaymiz
      { $push: { tags: { $each: tagIds } } }, //tags maydoniga barcha tagIds ni qo'shamiz
      { session } //transaction session ni o'tkazamiz
    );

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) }; //question obyektini JSON ga aylantirib frontendga qaytaradi
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== userId) {
      throw new Error("You are not authorized to edit this question");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    // Determine tags to add and remove
    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some(
          (t: ITagDoc) => t.name.toLowerCase() === tag.toLowerCase()
        )
    );

    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    // Add new tags
    const newTagDocuments = [];
    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const newTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        if (newTag) {
          newTagDocuments.push({ tag: newTag._id, question: questionId });
          question.tags.push(newTag._id);
        }
      }
    }

    // Remove tags
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session }
      );

      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: questionId },
        { session }
      );

      question.tags = question.tags.filter(
        (tag: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id)
          )
      );
    }

    // Insert new TagQuestion documents
    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    // Save the updated question
    await question.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

//get question details action whether we have edited everything correctly
export async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
    // authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId)
      .populate("tags", "_id name")
      .populate("author", "_id name image");

    if (!question) {
      throw new Error("Question not found");
    }

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// FETCH ALL THE QUESTIONS BASED ON THE SEARCH CRITERIA
export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  // const filterQuery: FilterQuery<typeof Question> = {};
  type QuestionFilter = {
    //QuestionFilter tipi yaratamiz
    $or?: {
      // $or operatori bilan qidirish uchun massiv
      title?: { $regex: RegExp }; //
      content?: { $regex: RegExp };
    }[];
    answers?: number;
  };
  const filterQuery: QuestionFilter = {}; //filterQuery obyekti yaratamiz, u Question hujjatlarini qidirishda ishlatiladi

  if (filter === "recommended") {
    //recommended filter hali amalga oshirilmagan
    return { success: true, data: { questions: [], isNext: false } }; //bo'sh massiv qaytaradi
  }

  // Search query filtering
  if (query) {
    filterQuery.$or = [
      //search query ni title va content maydonlarida qidiradi
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
  }

  let sortCriteria = {};

  switch (
    filter //filter ga qarab saralash mezonlarini belgilaydi
  ) {
    case "newest":
      sortCriteria = { createdAt: -1 }; //-1 bu kamayish tartibini bildiradi, ya'ni yangi yaratilganlar birinchi bo'ladi
      break;
    case "unanswered":
      filterQuery.answers = 0; //javobsiz savollarni olish uchun filterQuery ga answers maydonini 0 ga tenglashtiramiz
      sortCriteria = { createdAt: -1 }; //so'ngra ularni yaratilish sanasiga ko'ra kamayish tartibida saralaymiz
      break;
    case "popular":
      sortCriteria = { upvotes: -1 }; //eng ko'p ovoz olgan savollarni birinchi o'ringa qo'yadi
      break;
    default:
      sortCriteria = { createdAt: -1 }; //default holatda yangi yaratilgan savollar birinchi bo'ladi
      break;
  }

  try {
    const totalQuestions = await Question.countDocuments(filterQuery); //

    const questions = await Question.find(filterQuery) // qidiruv mezonlariga mos keladigan savollarni topadi
      .populate("tags", "name") // tag larni nomlari bilan birga oladi
      .populate("author", "name image")
      // muallifning nomi va rasm ma'lumotlarini oladi
      .lean() //Mongoose hujjatlarini oddiy JavaScript obyektlariga aylantiradi
      .sort(sortCriteria) //
      .skip(skip)
      .limit(limit); // how many questions per page

    // Determine if there is a next page
    const isNext = totalQuestions > skip + questions.length;
    //agar jami savollar soni, o'tkazib yuborilgan savollar soni va hozirgi sahifadagi savollar sonining yig'indisidan katta bo'lsa, demak keyingi sahifa mavjud

    return {
      success: true,
      data: { questions: JSON.parse(JSON.stringify(questions)), isNext }, //questions massivini JSON ga aylantirib qaytaradi
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
