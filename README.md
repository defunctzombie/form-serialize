# form-serialize

[![badge](https://ci.testling.com/shtylman/form-serialize.png)](https://ci.testling.com/shtylman/form-serialize)

serialize form fields to submit a form over ajax

## install

```shell
npm install form-serialize
```

## use

form-serialize supports two output formats, url encoded (default) or hash (js objects).

Lets serialize the following html form:
```html
<form id="example-form">
	<input type="text" name="foo" value="bar"/>
	<input type="submit" value="do it!"/>
</form>
```

```js
var serialize = require('form-serialize');
var form = document.querySelector('#example-form');

var str = serialize(form);
// str -> "foo=bar"

var obj = serialize(form, { hash: true });
// obj -> { foo: 'bar' }
```

## api

### serialize(form [, options])

Returns a serialized form of a HTMLForm element. Output is determined by the serializer used. Default serializer is url-encoded.

arg | type | desc
:--- | :--- | :---
form | HTMLForm | must be an HTMLForm element
options | Object | optional options object

#### options

option | type | desc
:--- | :--- | :---
hash | boolean | if true, the default hash serializer will be used
serializer | function | provide a custom serializer

### custom serializer

Serializers take 3 arguments: `result`, `key`, `value` and should return a newly updated result.

See the example serializers in the index.js source file.

## notes

only [successfull control](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2) form fields are serialized

multiselect fields with more than one value will result in an array of values in the `hash` output mode using the default hash serializer

## references

This module is based on ideas from jQuery serialize and the Form.serialize method from the prototype library

## license

MIT
