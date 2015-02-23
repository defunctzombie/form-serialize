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

test('nothing', function() {
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
    var form = domify('<form>' +
        '<input type="checkbox" name="foo" value="bar3" checked="checked"/>' +
        '<input type="radio" name="foo" value="bar1" checked="checked"/>' +
        '<input type="radio" name="foo" value="bar2"/>' +
        '<input type="checkbox" name="foo" value="bar4"/>' +
        '</form>');
    hash_check(form, {
        foo: ['bar3', 'bar1']
    });
    str_check(form, 'foo=bar3&foo=bar1');
});

test('nested hashes with brackets', function() {
    var form = domify('<form>' +
        '<input type="email" name="account[name]" value="Foo Dude">' +
        '<input type="text" name="account[email]" value="foobar@example.org">' +
        '<input type="text" name="account[address][city]" value="Qux">' +
        '<input type="text" name="account[address][state]" value="CA">' +
        '<input type="text" name="account[address][empty]" value="">' +
        '<select name="beer[type]" multiple>' +
        '  <option value="ipa" selected>IPA</option>' +
        '  <option value="pale-ale">Pale Ale</option>' +
        '  <option value="amber-ale" selected>Amber Ale</option>' +
        '</select>' +
        '<select name="wine[type]" multiple>' +
        '  <option value="">No wine</option>' +
        '  <option value="white">White</option>' +
        '  <option value="red">Red</option>' +
        '  <option value="sparkling">Sparkling</option>' +
        '</select>' +
        '</form>');

    hash_check(form, {
        account: {
        name: 'Foo Dude',
        email: 'foobar@example.org',
        address: {
            city: 'Qux',
            state: 'CA'
        }
        },
        beer: {
            type: [ 'ipa', 'amber-ale' ]
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
        },
        beer: {
            type: [ 'ipa', 'amber-ale' ]
        },
        wine: {
            type: ""
        }
    });
    str_check(form, 'account%5Bname%5D=Foo+Dude&account%5Bemail%5D=foobar%40example.org&account%5Baddress%5D%5Bcity%5D=Qux&account%5Baddress%5D%5Bstate%5D=CA&beer%5Btype%5D=ipa&beer%5Btype%5D=amber-ale');
    empty_check(form, 'account%5Bname%5D=Foo+Dude&account%5Bemail%5D=foobar%40example.org&account%5Baddress%5D%5Bcity%5D=Qux&account%5Baddress%5D%5Bstate%5D=CA&account%5Baddress%5D%5Bempty%5D=&beer%5Btype%5D=ipa&beer%5Btype%5D=amber-ale&wine%5Btype%5D=')
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
