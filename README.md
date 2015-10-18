# form-serialize [![Build Status](https://travis-ci.org/defunctzombie/form-serialize.png?branch=master)](https://travis-ci.org/defunctzombie/form-serialize)

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

option | type | default | desc
:--- | :--- | :---: | :---
hash | boolean | false | if `true`, the hash serializer will be used for `serializer` option
serializer | function | url-encoding | override the default serializer (hash or url-encoding)
disabled | boolean | false | if `true`, disabled fields will also be serialized
empty | boolean | false | if `true`, empty fields will also be serialized

### custom serializer

Serializers take 3 arguments: `result`, `key`, `value` and should return a newly updated result.

See the example serializers in the index.js source file.

## notes

only [successful control](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2) form fields are serialized (with the exception of disabled fields if disabled option is set)

multiselect fields with more than one value will result in an array of values in the `hash` output mode using the default hash serializer

### explicit array fields

Fields who's name ends with `[]` are **always** serialized as an array field in `hash` output mode using the default hash serializer.
The field name also gets the brackets removed from its name.

This does not affect `url-encoding` mode output in any way.

```html
<form id="example-form">
	<input type="checkbox" name="foo[]" value="bar" checked />
	<input type="checkbox" name="foo[]" value="baz" />
	<input type="submit" value="do it!"/>
</form>
```

```js
var serialize = require('form-serialize');
var form = document.querySelector('#example-form');

var obj = serialize(form, { hash: true });
// obj -> { foo: ['bar'] }

var str = serialize(form);
// str -> "foo[]=bar"

```

### indexed arrays

Adding numbers between brackets for the array notation above will result in a hash serialization with explicit ordering based on the index number regardless of element ordering.

Like the "[explicit array fields](explicit-array-fields)" this does not affect url-encoding mode output in any way.

```html
<form id="todos-form">
	<input type="text" name="todos[1]" value="milk" />
	<input type="text" name="todos[0]" value="eggs" />
	<input type="text" name="todos[2]" value="flour" />
</form>
```

```js
var serialize = require('form-serialize');
var form = document.querySelector('#todos-form');

var obj = serialize(form, { hash: true });
// obj -> { todos: ['eggs', 'milk', 'flour'] }

var str = serialize(form);
// str -> "todos[1]=milk&todos[0]=eggs&todos[2]=flour"

```

### nested objects

Similar to the indexed array notation, attribute names can be added by inserting a string value between brackets. The notation can be used to create deep objects and mixed with the array notation.

Like the "[explicit array fields](explicit-array-fields)" this does not affect url-encoding mode output.

```html
<form id="nested-example">
	<input type="text" name="foo[bar][baz]" value="qux" />
	<input type="text" name="foo[norf][]" value="item 1" />
</form>
```

```js
var serialize = require('form-serialize');
var form = document.querySelector('#todos-form');

var obj = serialize(form, { hash: true });
// obj -> { foo: { bar: { baz: 'qux' } }, norf: [ 'item 1' ] }

```

## references

This module is based on ideas from jQuery serialize and the Form.serialize method from the prototype library

## license

MIT
