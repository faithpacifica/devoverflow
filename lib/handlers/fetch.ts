//common fetch handler for all account routes standartizing elements and ensuring all requests follow same structure

import { RequestError } from "../http-errors";
import logger from "../logger";
import handleError from "./error";

interface FetchOptions extends RequestInit { //RequestInit is built-in type defining options for fetch requests
  timeout?: number; 
}

function isError(error: unknown): error is Error { // bu yerda TypeScript type guard ishlatilgan, u unknown turidagi o'zgaruvchini Error turiga tekshiradi va aniqlaydi
  return error instanceof Error; //agar error Error ning instance bo'lsa true qaytaradi, instance bu yerda obyekt ma'lum bir sinfga tegishli ekanligini tekshiradi
}

export async function fetchHandler<T>( //<T> generic type parameter to specify expected response data type
  url: string,
  options: FetchOptions = {}
): Promise<ActionResponse<T>> { // Promise<ActionResponse<T>> bu yerda fetchHandler funksiyasining qaytish turini ifodalaydi, ya'ni u ActionResponse<T> turidagi ma'lumotlarni o'z ichiga olgan va'da (Promise) bo'ladi
  const {
    timeout = 100000,//default timeout of 100 seconds
    headers: customHeaders = {}, //custom headers if any
    ...restOptions //other fetch options like method, body, etc.
  } = options; //destructuring options

  const controller = new AbortController(); //to handle request timeout
  const id = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders: HeadersInit = { //default headers for all requests   ,HeadersInit is built-in type defining headers object
    "Content-Type": "application/json", //indicating request body is JSON
    Accept: "application/json", //indicating client expects JSON response
  };

  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders }; //merging default and custom headers
  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal, //attaching abort signal to fetch config
  };

  try {
    const response = await fetch(url, config);//making the fetch request with url and config

    clearTimeout(id); //clearing timeout once response is received

    if (!response.ok) {
      throw new RequestError(response.status, `HTTP error: ${response.status}`); //bu yerda RequestError custom error class bo'lib, u HTTP status code va message qabul qiladi response.status tekshiriladi, agar response.ok false bo'lsa, ya'ni status code 200-299 oralig'ida bo'lmasa, RequestError tashlanadi
    }

    return await response.json();

  } catch (err) {
    const error = isError(err) ? err : new Error("Unknown error");

    if (error.name === "AbortError") {
      logger.warn(`Request to ${url} timed out`);
    } else {
      logger.error(`Error fetching ${url}: ${error.message}`);
    }

    return handleError(error) as ActionResponse<T>; //bu yerda handleError funksiyasi chaqiriladi va uning natijasi ActionResponse<T> turiga kiritiladi, ActionResponse<T> bu yerda fetchHandler funksiyasining qaytish turini ifodalaydi, ya'ni u T turidagi ma'lumotlarni o'z ichiga olgan javob bo'ladi
  }
}