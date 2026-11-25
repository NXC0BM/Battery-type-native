/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RegisterUserDto {
  username: string;
  password: string;
}

export interface BatteryTypeResponseDto {
  modelUrl: string | null;
  shortDescriptionEn: string | null;
  rotationX: number;
  rotationY: number;
  id: number;
  modelName: string;
  shortDescription: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  capacityMah: number | null;
  nominalVoltageV: number | null;
  likesCount: number;
  isMine: number;
  isLiked: number;
  attributes: object[];
}

export interface BatteryTypePageDto {
  items: BatteryTypeResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AttributeValueDto {
  name: string;
  value: string;
  unit?: string;
}

export interface PublishBatteryTypeDto {
  /** @example "Li-ion аккумулятор для электроинструмента" */
  shortDescription: string;
  /** @example 3000 */
  capacityMah: number;
  /** @example 3.6 */
  nominalVoltageV: number;
  /** @example "Green cylindrical lithium ion battery cell for portable power tools." */
  shortDescriptionEn: string;
  attributes?: AttributeValueDto[];
}

export interface RotationBatteryTypeDto {
  rotationX: number;
  rotationY: number;
  previousX: number;
  previousY: number;
}

export interface LikeBatteryTypeDto {
  /** @example 1 */
  like: 0 | 1;
}

export interface LoginDto {
  username: string;
  password: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Battery Runtime API
 * @version 1.0
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @name UsersControllerRegister
     * @request POST:/api/users/register
     */
    usersControllerRegister: (
      data: RegisterUserDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/users/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerGetList
     * @summary Список опубликованных карточек (доступно без авторизации)
     * @request GET:/api/battery_type
     */
    batteryTypeControllerGetList: (
      query?: {
        minCapacityMah?: number;
        limit?: number;
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<BatteryTypePageDto, any>({
        path: `/api/battery_type`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerCreate
     * @summary Создать черновик с файлами
     * @request POST:/api/battery_type
     * @secure
     */
    batteryTypeControllerCreate: (
      data: {
        modelName: string;
        /** @format binary */
        image?: File;
        /** @format binary */
        video?: File;
        /** @format binary */
        model?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/battery_type`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerDescriptions
     * @summary Уникальные английские описания для поиска CLIP
     * @request GET:/api/battery_type/descriptions
     */
    batteryTypeControllerDescriptions: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/battery_type/descriptions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerGetFeed
     * @summary Лента (доступно без авторизации)
     * @request GET:/api/battery_type/feed
     */
    batteryTypeControllerGetFeed: (
      query?: {
        id?: number;
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<BatteryTypeResponseDto, any>({
        path: `/api/battery_type/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerGetDraft
     * @summary Черновик текущего пользователя
     * @request GET:/api/battery_type/draft
     * @secure
     */
    batteryTypeControllerGetDraft: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/battery_type/draft`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerPublish
     * @summary Опубликовать черновик
     * @request PUT:/api/battery_type/{id}/publish
     * @secure
     */
    batteryTypeControllerPublish: (
      id: number,
      data: PublishBatteryTypeDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/battery_type/${id}/publish`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerRotation
     * @summary Внести результат asyncio; X-Battery-Type-Key
     * @request PUT:/api/battery_type/{id}/rotation
     */
    batteryTypeControllerRotation: (
      id: number,
      data: RotationBatteryTypeDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/battery_type/${id}/rotation`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerRemove
     * @summary Удалить карточку (своя)
     * @request DELETE:/api/battery_type/{id}
     * @secure
     */
    batteryTypeControllerRemove: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/battery_type/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags battery_type
     * @name BatteryTypeControllerLike
     * @summary Поставить/убрать лайк
     * @request POST:/api/battery_type/{id}/like
     * @secure
     */
    batteryTypeControllerLike: (
      id: number,
      data: LikeBatteryTypeDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/battery_type/${id}/like`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name AuthControllerLogin
     * @summary Вход — создаёт сессию и куку
     * @request POST:/api/users/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/users/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name AuthControllerLogout
     * @summary Выход — удаляет сессию
     * @request POST:/api/users/logout
     */
    authControllerLogout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/users/logout`,
        method: "POST",
        ...params,
      }),
  };
}
