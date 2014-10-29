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

test('nothing', function() {
    var form = domify('<form></form>');
    hash_check(form, {});
    str_check(form, '');
});

// basic form with single input
test('single element', function() {
    var form = domify('<form><input type="text" name="foo" value="bar"/></form>');
    hash_check(form, {
        'foo': 'bar'
    });
    str_check(form, 'foo=bar');
});

test('ignore no value', function() {
    var form = domify('<form><input type="text" name="foo"/></form>');
    hash_check(form, {});
    str_check(form, '');
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
});

test('checkboxes - array', function() {
    var form = domify('<form>' +
        '<input type="checkbox" name="foo[]" value="bar" checked/>' +
        '<input type="checkbox" name="foo[]" value="baz" checked/>' +
        '</form>');
    hash_check(form, {
        'foo': ['bar', 'baz']
    });
    str_check(form, 'foo%5B%5D=bar&foo%5B%5D=baz');
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

test('radio - no default', function() {
    var form = domify('<form>' +
        '<input type="radio" name="foo" value="bar1"/>' +
        '<input type="radio" name="foo" value="bar2"/>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
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
        '<select name="beer[type]" multiple>' +
        '  <option value="ipa" selected>IPA</option>' +
        '  <option value="pale-ale">Pale Ale</option>' +
        '  <option value="amber-ale" selected>Amber Ale</option>' +
        '</select>' +
        '</form>');

    hash_check(form, {
        account: {
        name: 'Foo Dude',
        email: 'foobar@example.org',
        address: {
            city: 'Qux'
        }
        },
        beer: {
            type: [ 'ipa', 'amber-ale' ]
        }
    });
    str_check(form, 'account%5Bname%5D=Foo+Dude&account%5Bemail%5D=foobar%40example.org&account%5Baddress%5D%5Bcity%5D=Qux&beer%5Btype%5D=ipa&beer%5Btype%5D=amber-ale');
});
