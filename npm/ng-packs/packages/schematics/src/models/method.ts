import { eBindingSourceId, eMethodModifier } from '../enums';
import { isValidProp } from '../utils/prop';
import { camel } from '../utils/text';
import { ParameterInBody } from './api-definition';
import { Property } from './model';
import { Omissible } from './util';

export class Method {
  body: Body;
  signature: Signature;

  constructor(options: MethodOptions) {
    Object.assign(this, options);
  }
}

export type MethodOptions = Method;

export class Signature {
  generics = '';
  modifier = eMethodModifier.Public;
  name: string;
  parameters: Property[] = [];
  returnType = '';

  constructor(options: SignatureOptions) {
    Object.assign(this, options);
  }
}

export type SignatureOptions = Omissible<
  Signature,
  'generics' | 'modifier' | 'parameters' | 'returnType'
>;

export class Body {
  body?: string;
  method: string;
  params: string[] = [];
  requestType = 'any';
  responseType: string;
  url: string;

  registerActionParameter = (param: ParameterInBody) => {
    const { bindingSourceId, descriptorName, jsonName, name, nameOnMethod } = param;
    const camelName = camel(name);
    const paramName = jsonName || camelName;
    const value = descriptorName
      ? isValidProp(paramName)
        ? `${descriptorName}.${paramName}`
        : `${descriptorName}['${paramName}']`
      : nameOnMethod;

    switch (bindingSourceId) {
      case eBindingSourceId.Model:
      case eBindingSourceId.Query:
        this.params.push(`${paramName}: ${value}`);
        break;
      case eBindingSourceId.Body:
        this.body = value;
        break;
      case eBindingSourceId.Path:
        const regex = new RegExp('{(' + paramName + '|' + camelName + '|' + name + ')}', 'g');
        this.url = this.url.replace(regex, '${' + value + '}');
        break;
      default:
        break;
    }
  };

  constructor(options: BodyOptions) {
    Object.assign(this, options);
  }
}

export type BodyOptions = Omissible<
  Omit<Body, 'registerActionParameter'>,
  'params' | 'requestType'
>;
