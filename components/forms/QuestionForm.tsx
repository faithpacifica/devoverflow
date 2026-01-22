"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AskQuestionSchema } from "@/lib/validations";
import { Button } from "../ui/button";
import dynamic from "next/dynamic";
import React, { useRef } from "react";
import "@mdxeditor/editor/style.css";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import TagCard from "../cards/TagCard";
import { toast } from "sonner";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import { ReloadIcon } from "@radix-ui/react-icons";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface Params {
  question?: Question;
  isEdit?: boolean;
}

const QuestionForm = ({ question, isEdit = false }: Params) => {
  const router = useRouter();

  const editorRef = useRef<MDXEditorMethods>(null); //editorRef ni yaratamiz va uni MDXEditorMethods turiga o'rnatamiz , useREf bu React hook bo'lib, u komponentlar orasida mutable (o'zgarmas) qiymatlarni saqlash uchun ishlatiladi

  const [isPending, startTransition] = React.useTransition(); // useTransition bu React 18 ning hook i bo'lib, u asinxron operatsiyalarni boshqarish uchun ishlatiladi va foydalanuvchi interfeysining bloklanishining oldini oladi

  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    //form ni yaratamiz va uning turini AskQuestionSchema dan infer qilamiz . infer bu Zod kutubxonasining xususiyati bo'lib, u berilgan schema asosida TypeScript turlarini avtomatik ravishda chiqarib olish imkonini beradi
    resolver: zodResolver(AskQuestionSchema), //resolver bu react-hook-form ga schema asosida formani tekshirish imkonini beradi, zodResolver esa Zod schema larini ishlatish uchun maxsus resolver dir
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  });

  const handleTageRemove = (tag: string, field: { value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag); // t is each tag in the array,while tag is the tag to be removed
    form.setValue("tags", newTags);
    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "Please add at least one tag.",
      });
    }
  };

  const handleCreateQuestion = async (
    data: z.infer<typeof AskQuestionSchema>
  ) => {
    startTransition(async () => {
      //startTransition bu React 18 ning hook i bo'lib, u asinxron operatsiyalarni boshlash uchun ishlatiladi va foydalanuvchi interfeysining bloklanishining oldini oladi

      // EDIT QUESTION
      if (isEdit && question) {
        const result = await editQuestion({
          ...data,
          questionId: question?._id,
        });
        console.log(result, "result")
        if (result.success) {
          toast.success("Question updated successfully");
          // TODO:_id ni hal qilish, edit page ishlamayapti
          if (result.data) router.push(ROUTES.QUESTION(result.data._id));
        } else {
          toast.error(result.error?.message || "Failed to create question");
        }
        return; //return qo'shamiz, chunki agar biz edit rejimida bo'lsak, quyidagi createQuestion qismi bajarilmasligi kerak
      }


      // CREATE QUESTION
      const result = await createQuestion(data);
      if (result.success) {
        toast.success("Question created successfully");
        if (result.data) router.push(ROUTES.QUESTION(result.data._id));
      } else {
        toast.error(result.error?.message || "Failed to create question");
      }
    });
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] }
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tagInput = e.currentTarget.value.trim();
      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue("tags", [...field.value, tagInput]);
        e.currentTarget.value = "";
        form.clearErrors("tags");
      } else if (tagInput.length > 15) {
        form.setError("tags", {
          type: "manual",
          message: "Tag should be less than 15 characters.",
        });
      } else if (field.value.includes(tagInput)) {
        form.setError("tags", {
          type: "manual",
          message: "Tag already added.",
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-10"
        onSubmit={form.handleSubmit(handleCreateQuestion)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Question Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Be specific and imagine you&apos;re asking a question to another
                person.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Detailed explanation of your problem{" "}
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Editor
                  editorRef={editorRef}
                  value={field.value}
                  fieldChange={field.onChange}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Introduce the problem and expand on what you&apos;ve put in the
                title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div>
                  <Input
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                    placeholder="Add tags..."
                    onKeyDown={(e) => {
                      handleInputKeyDown(e, field);
                    }}
                  />
                  {field.value.length > 0 && (
                    <div className="m-4 flex gap-5">
                      {field?.value?.map((tag: string) => (
                        <TagCard
                          key={tag}
                          _id={tag}
                          name={tag}
                          compact
                          remove
                          isButton
                          handleRemove={() => handleTageRemove(tag, field)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Add up to 3 tags to describe what your question is about. You
                need to press enter to add a tag.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-16 flex justify-end">
          <Button
            type="submit"
            disabled={isPending} //isPending bu React 18 ning useTransition hook dan olingan bo'lib, u asinxron operatsiya davom etayotganligini bildiradi ,isPending true bo'lsa, tugma disabled holatida bo'ladi
            className="cursor-pointer !rounded-md primary-gradient w-fit !text-light-900"
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                <span>Submitting</span>
              </>
            ) : (
              <>{isEdit ? "Edit" : "Ask A Question"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;
