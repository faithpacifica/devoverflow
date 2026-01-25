import { NextResponse } from "next/server";
import Tag from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";

export async function GET() {
  try {
    // Get all tags
    const tags = await Tag.find({});

    for (const tag of tags) {
      // Count how many questions this tag has
      const count = await TagQuestion.countDocuments({ tag: tag._id });

      // Update the tag's question count
      await Tag.findByIdAndUpdate(tag._id, { question: count });

      console.log(`Updated ${tag.name}: ${count} questions`);
    }

    return NextResponse.json({ success: true, message: 'All tag counts updated successfully' });
  } catch (error) {
    console.error('Error updating tag counts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}