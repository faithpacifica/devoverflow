import { getTags } from "@/lib/actions/tag.actions";
import React from "react";

const Tags = async () => {
  const { success, data, error } = await getTags({
    page: 1,
    pageSize: 10,
    query: "REACT",
  });

  const { tags } = data || {};

  console.log("TAGS", JSON.stringify(tags, null, 1));
  return <div>Tags</div>;
};

export default Tags;
