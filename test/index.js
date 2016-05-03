var assert = require('assert');
var domify = require('domify');

var serialize = require('../');

var hash_check = function(form, exp) {
    assert.deepEqual(serialize(form, { hash: true }), exp);
};

var str_check = function(form, exp) {
    assert.equal(serialize(form), exp);
};

var disabled_check = function(form, exp) {
    assert.deepEqual(serialize(form, { hash : false, disabled: true }), exp);
};

var empty_check = function(form, exp) {
    assert.deepEqual(serialize(form, { hash : false, disabled: true, empty: true }), exp);
};

var empty_check_hash = function(form, exp) {
    assert.deepEqual(serialize(form, { hash : true, disabled: true, empty: true }), exp);
};

test('null form', function() {
    hash_check(null, {});
    str_check(null, '');
    empty_check(null, '');
    empty_check_hash(null, {});
});

test('bad form', function() {
    var form = {};
    hash_check(form, {});
    str_check(form, '');
    empty_check(form, '');
    empty_check_hash(form, {});
});

test('empty form', function() {
    var form = domify('<form></form>');
    hash_check(form, {});
    str_check(form, '');
    empty_check(form, '');
    empty_check_hash(form, {});
});

// basic form with single input
test('single element', function() {
    var form = domify('<form><input type="text" name="foo" value="bar"/></form>');
    hash_check(form, {
        'foo': 'bar'
    });
    str_check(form, 'foo=bar');
    empty_check(form, 'foo=bar');
    empty_check_hash(form, {
        'foo': 'bar'
    });
});

test('ignore no value', function() {
    var form = domify('<form><input type="text" name="foo"/></form>');
    hash_check(form, {});
    str_check(form, '');
});

test('do not ignore no value when empty option', function() {
    var form = domify('<form><input type="text" name="foo"/></form>');
    empty_check(form, 'foo=');
    empty_check_hash(form, {
        'foo': ''
    });
});

test('multi inputs', function() {
    var form = domify('<form>' +
        '<input type="text" name="foo" value="bar 1"/>' +
        '<input type="text" name="foo.bar" value="bar 2"/>' +
        '<input type="text" name="baz.foo" value="bar 3"/>' +
        '</form>');
    hash_check(form, {
        'foo': 'bar 1',
        'foo.bar': 'bar 2',
        'baz.foo': 'bar 3'
    });
    str_check(form, 'foo=bar+1&foo.bar=bar+2&baz.foo=bar+3');
});

test('handle disabled', function() {
    var form = domify('<form>' +
        '<input type="text" name="foo" value="bar 1"/>' +
        '<input type="text" name="foo.bar" value="bar 2" disabled/>' +
        '</form>');
    hash_check(form, {
        'foo': 'bar 1'
    });
    str_check(form, 'foo=bar+1');
    disabled_check(form, 'foo=bar+1&foo.bar=bar+2');
});

test('handle disabled and empty', function() {
    var form = domify('<form>' +
        '<input type="text" name="foo" value=""/>' +
        '<input type="text" name="foo.bar" value="" disabled/>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
    disabled_check(form, '');
    empty_check(form, 'foo=&foo.bar=');
    empty_check_hash(form, {
        'foo': '',
        'foo.bar': ''
    });
});

test('ignore buttons', function() {
    var form = domify('<form>' +
        '<input type="submit" name="foo" value="submit"/>' +
        '<input type="reset" name="foo.bar" value="reset"/>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
});

test('checkboxes', function() {
    var form = domify('<form>' +
        '<input type="checkbox" name="foo" checked/>' +
        '<input type="checkbox" name="bar"/>' +
        '<input type="checkbox" name="baz" checked/>' +
        '</form>');
    hash_check(form, {
        'foo': "on",
        'baz': "on"
    });
    str_check(form, 'foo=on&baz=on');
    empty_check(form, 'foo=on&bar=&baz=on');
    empty_check_hash(form, {
        'foo': 'on',
        'bar': '',
        'baz': 'on'
    });
});

test('checkboxes - array', function() {
    var form = domify('<form>' +
        '<input type="checkbox" name="foo[]" value="bar" checked/>' +
        '<input type="checkbox" name="foo[]" value="baz" checked/>' +
        '<input type="checkbox" name="foo[]" value="baz"/>' +
        '</form>');
    hash_check(form, {
        'foo': ['bar', 'baz']
    });
    str_check(form, 'foo%5B%5D=bar&foo%5B%5D=baz');
    empty_check(form, 'foo%5B%5D=bar&foo%5B%5D=baz&foo%5B%5D=');
    empty_check_hash(form, {
        'foo': ['bar', 'baz', '']
    });
});

test('checkboxes - array with single item', function() {
    var form = domify('<form>' +
        '<input type="checkbox" name="foo[]" value="bar" checked/>' +
        '</form>');
    hash_check(form, {
        'foo': ['bar']
    });
    str_check(form, 'foo%5B%5D=bar');
});

test('select - single', function() {
    var form = domify('<form>' +
        '<select name="foo">' +
        '<option value="bar">bar</option>' +
        '<option value="baz" selected>baz</option>' +
        '</select>' +
        '</form>');
    hash_check(form, {
        'foo': 'baz'
    });
    str_check(form, 'foo=baz');
});

test('select - single - empty', function () {
    var form = domify('<form>' +
        '<select name="foo">' +
        '<option value="">empty</option>' +
        '<option value="bar">bar</option>' +
        '<option value="baz">baz</option>' +
        '</select>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
    empty_check(form, 'foo=');
    empty_check_hash(form, {
        'foo': ''
    });
});

test('select - multiple', function() {
    var form = domify('<form>' +
        '<select name="foo" multiple>' +
        '<option value="bar" selected>bar</option>' +
        '<option value="baz">baz</option>' +
        '<option value="cat" selected>cat</option>' +
        '</select>' +
        '</form>');
    hash_check(form, {
        'foo': ['bar', 'cat']
    });
    str_check(form, 'foo=bar&foo=cat');
});

test('select - multiple - empty', function() {
    var form = domify('<form>' +
        '<select name="foo" multiple>' +
        '<option value="">empty</option>' +
        '<option value="bar">bar</option>' +
        '<option value="baz">baz</option>' +
        '<option value="cat">cat</option>' +
        '</select>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
    empty_check(form, 'foo=');
    empty_check_hash(form, {
        'foo': ''
    });
});

test('radio - no default', function() {
    var form = domify('<form>' +
        '<input type="radio" name="foo" value="bar1"/>' +
        '<input type="radio" name="foo" value="bar2"/>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
    empty_check(form, 'foo=');
    empty_check_hash(form, {
        'foo':''
    });
});

test('radio - single default', function() {
    var form = domify('<form>' +
        '<input type="radio" name="foo" value="bar1" checked="checked"/>' +
        '<input type="radio" name="foo" value="bar2"/>' +
        '</form>');
    hash_check(form, {
        foo: 'bar1'
    });
    str_check(form, 'foo=bar1');
    empty_check(form, 'foo=bar1');
    empty_check_hash(form, {
        foo: 'bar1'
    });
});

test('radio - empty value', function() {
    var form = domify('<form>' +
        '<input type="radio" name="foo" value="" checked="checked"/>' +
        '<input type="radio" name="foo" value="bar2"/>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
    empty_check(form, 'foo=');
    empty_check_hash(form, {
        'foo':''
    });
});

// in this case the radio buttons and checkboxes share a name key
// the checkbox value should still be honored
test('radio w/checkbox', function() {
    var form = domify('<form>' +
        '<input type="radio" name="foo" value="bar1" checked="checked"/>' +
        '<input type="radio" name="foo" value="bar2"/>' +
        '<input type="checkbox" name="foo" value="bar3" checked="checked"/>' +
        '<input type="checkbox" name="foo" value="bar4"/>' +
        '</form>');
    hash_check(form, {
        foo: ['bar1', 'bar3']
    });
    str_check(form, 'foo=bar1&foo=bar3');

    // leading checkbox
    form = domify('<form>' +
        '<input type="checkbox" name="foo" value="bar3" checked="checked"/>' +
        '<input type="radio" name="foo" value="bar1" checked="checked"/>' +
        '<input type="radio" name="foo" value="bar2"/>' +
        '<input type="checkbox" name="foo" value="bar4"/>' +
        '<input type="checkbox" name="foo" value="bar5" checked="checked"/>' +
        '</form>');
    hash_check(form, {
        foo: ['bar3', 'bar1', 'bar5']
    });
    str_check(form, 'foo=bar3&foo=bar1&foo=bar5');
});

test('bracket notation - hashes', function() {
    var form = domify('<form>' +
        '<input type="email" name="account[name]" value="Foo Dude">' +
        '<input type="text" name="account[email]" value="foobar@example.org">' +
        '<input type="text" name="account[address][city]" value="Qux">' +
        '<input type="text" name="account[address][state]" value="CA">' +
        '<input type="text" name="account[address][empty]" value="">' +
        '</form>');

    hash_check(form, {
        account: {
            name: 'Foo Dude',
            email: 'foobar@example.org',
            address: {
                city: 'Qux',
                state: 'CA'
            }
        }
    });

    empty_check_hash(form, {
        account: {
            name: 'Foo Dude',
            email: 'foobar@example.org',
            address: {
                city: 'Qux',
                state: 'CA',
                empty: ''
            }
        }
    });
});

test('bracket notation - hashes with a digit as the first symbol in a key', function() {
    var form = domify('<form>' +
        '<input type="text" name="somekey[123abc][first]" value="first_value">' +
        '<input type="text" name="somekey[123abc][second]" value="second_value">' +
        '</form>');

    hash_check(form, {
        'somekey': {
            '123abc': {
                'first': 'first_value',
                'second': 'second_value'
            }
        }
    });

    empty_check_hash(form, {
        'somekey': {
            '123abc': {
                'first': 'first_value',
                'second': 'second_value'
            }
        }
    });
});

test('bracket notation - select multiple', function() {
    var form = domify('<form>' +
        '<select name="foo" multiple>' +
        '  <option value="bar" selected>Bar</option>' +
        '  <option value="baz">Baz</option>' +
        '  <option value="qux" selected>Qux</option>' +
        '</select>' +
        '</form>');

    hash_check(form, {
        foo: [ 'bar', 'qux' ]
    });

    // Trailing notation on select.name.
    form = domify('<form>' +
        '<select name="foo[]" multiple>' +
        '  <option value="bar" selected>Bar</option>' +
        '  <option value="baz">Baz</option>' +
        '  <option value="qux" selected>Qux</option>' +
        '</select>' +
        '</form>');

    hash_check(form, {
        foo: [ 'bar', 'qux' ]
    });
});


test('bracket notation - select multiple, nested', function() {
    var form = domify('<form>' +
        '<select name="foo[bar]" multiple>' +
        '  <option value="baz" selected>Baz</option>' +
        '  <option value="qux">Qux</option>' +
        '  <option value="norf" selected>Norf</option>' +
        '</select>' +
        '</form>');

    hash_check(form, {
        foo: {
            bar: [ 'baz', 'norf' ]
        }
    });
});

test('bracket notation - select multiple, empty values', function() {
    var form = domify('<form>' +
        '<select name="foo[bar]" multiple>' +
        '  <option selected>Default value</option>' +
        '  <option value="" selected>Empty value</option>' +
        '  <option value="baz" selected>Baz</option>' +
        '  <option value="qux">Qux</option>' +
        '  <option value="norf" selected>Norf</option>' +
        '</select>' +
        '</form>');

    hash_check(form, {
        foo: {
            bar: [ 'Default value', 'baz', 'norf' ]
        }
    });

    empty_check_hash(form, {
        foo: {
            bar: [ 'Default value', '', 'baz', 'norf' ]
        }
    });
});

test('bracket notation - non-indexed arrays', function() {
    var form = domify('<form>' +
        '<input name="people[][name]" value="fred" />' +
        '<input name="people[][name]" value="bob" />' +
        '<input name="people[][name]" value="bubba" />' +
        '</form>');

    hash_check(form, {
        people: [
            { name: "fred" },
            { name: "bob" },
            { name: "bubba" },
        ]
    });
});

test('bracket notation - nested, non-indexed arrays', function() {
    var form = domify('<form>' +
        '<input name="user[tags][]" value="cow" />' +
        '<input name="user[tags][]" value="milk" />' +
        '</form>');

    hash_check(form, {
        user: {
            tags: [ "cow", "milk" ],
        }
    });
});

test('bracket notation - indexed arrays', function() {
    var form = domify('<form>' +
        '<input name="people[2][name]" value="bubba" />' +
        '<input name="people[2][age]" value="15" />' +
        '<input name="people[0][name]" value="fred" />' +
        '<input name="people[0][age]" value="12" />' +
        '<input name="people[1][name]" value="bob" />' +
        '<input name="people[1][age]" value="14" />' +
        '<input name="people[][name]" value="frank">' +
        '<input name="people[3][age]" value="2">' +
        '</form>');

    hash_check(form, {
        people: [
            {
                name: "fred",
                age: "12"
            },
            {
                name: "bob",
                age: "14"
            },
            {
                name: "bubba",
                age: "15"
            },
            {
                name: "frank",
                age: "2"
            }
        ]
    });
});

test('bracket notation - bad notation', function() {
    var form = domify('<form>' +
        '<input name="[][foo]" value="bar" />' +
        '<input name="[baz][qux]" value="norf" />' +
        '</form>');

    hash_check(form, {
        _values: [
            { foo: 'bar' }
        ],
        baz: { qux: 'norf' }
    });
});

test('custom serializer', function() {
  var form = domify('<form><input type="text" name="node" value="zuul">/</form>');

  assert.deepEqual(serialize(form, {
    serializer: function(curry, k, v) {
      curry[k] = 'ZUUL';
      return curry;
    }
  }), {
    "node": "ZUUL"
  });
});
