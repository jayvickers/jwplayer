define([
    'controller/tracks-helper',
    'utils/browser',
    'utils/underscore'
], function (tracksHelper, browser, _) {
    var test = QUnit.test.bind(QUnit);

    var isTrue = function() {
        return true;
    };

    var providersWithVideoElement = ['html5', 'shaka', 'caterpillar'];
    var providersWithoutVideoElement = ['flash', 'flash_adaptive', 'SDKProvider', 'custom_provider'];

    var assertionCount = providersWithVideoElement.length + providersWithoutVideoElement.length;

    var renderNatively = function(yes) {
        if (yes) {
            return ' renders captions natively';
        }
        return ' renders captions with captionsrenderer';
    };

    var assertNativeRendering = function(assert, providers, expected) {
        for (var i = 0; i < providers.length; i++) {
            var provider = providers[i];
            assert.equal(tracksHelper.renderNatively(provider), expected, provider + renderNatively(expected));
        }
    };

    // Tests for Native Rendering of Captions

    QUnit.module('tracksHelper.renderNatively', {
        beforeEach: function() {
            browser.isChrome = browser.isIOS = browser.isSafari =
                browser.isEdge = browser.isIE = browser.isFF = function() { return false; };
        }
    });

    test('Captions rendering in Chrome', function (assert) {

        browser.isChrome = isTrue;
        expect(assertionCount);

        assertNativeRendering(assert, providersWithVideoElement, true);
        assertNativeRendering(assert, providersWithoutVideoElement, false);
    });

    test('Captions rendering in iOS', function (assert) {
        browser.isIOS = isTrue;
        expect(assertionCount);

        assertNativeRendering(assert, providersWithVideoElement, true);
        assertNativeRendering(assert, providersWithoutVideoElement, false);
    });

    test('Captions rendering in Safari', function (assert) {
        browser.isSafari = isTrue;
        expect(assertionCount);

        assertNativeRendering(assert, providersWithVideoElement, true);
        assertNativeRendering(assert, providersWithoutVideoElement, false);
    });

    test('Captions rendering in Edge', function (assert) {
        browser.isEdge = isTrue;
        expect(assertionCount);

        assertNativeRendering(assert, providersWithVideoElement, true);
        assertNativeRendering(assert, providersWithoutVideoElement, false);
    });

    test('Captions rendering in FF', function (assert) {
        browser.isFF = isTrue;
        expect(assertionCount);

        assertNativeRendering(assert, providersWithVideoElement, false);
        assertNativeRendering(assert, providersWithoutVideoElement, false);
    });

    test('Captions rendering in IE', function (assert) {
        browser.isIE = isTrue;
        expect(assertionCount);

        assertNativeRendering(assert, providersWithVideoElement, false);
        assertNativeRendering(assert, providersWithoutVideoElement, false);
    });



    var tracks,
        itemTrack,
        prop,
        func,
        count;

    var setCount = function() {
        count = tracks.length;
    };

    var assertProperty = function(assert, propToDelete, expected, msg) {
        if(propToDelete) {
            delete itemTrack[propToDelete];
        }
        var track = _.extend({}, itemTrack);
        var val = tracksHelper[func](track, count);
        track[prop] = val[prop] || val;
        tracks.push(track);
        assert.equal(track[prop], expected, msg);
    };

    // Tests for Creating track._id

    QUnit.module('tracksHelper.createId');

    test('Create track._id from track properties', function (assert) {
        tracks = [];
        itemTrack = {
            _id: '_id',
            defaulttrack: true,
            default: true,
            file: 'file',
            kind: 'kind',
            label: 'label',
            name: 'name',
            language: 'language'
        };
        prop = '_id';
        func = 'createId';
        count = 0;

        expect(8);

        assertProperty(assert, '', 'default', 'track.default is 1st priority even if other properties are set');
        assertProperty(assert, 'default', 'default',
            'track.defaulttrack is 2nd priority even if other properties are set');
        assertProperty(assert, 'defaulttrack', '_id', 'track._id is used if track.default is undefined');
        assertProperty(assert, '_id', 'name', 'track.name is used if track.default or track._id is undefined');
        assertProperty(assert, 'name', 'file',
            'track.file is prioritized over track.label if other properties are undefined.');
        assertProperty(assert, 'file', 'label', 'track.label only has a higher priority than track.kind');
        setCount();
        assertProperty(assert, 'label', 'kind' + count, 'track.kind is lowest priority');
        setCount();
        assertProperty(assert, 'kind', 'cc' + count, 'cc is used as the prefix if no other properties are set');
    });

    // Tests for creating track.label

    QUnit.module('tracksHelper.createLabel');

    test('Create track label from track properties', function (assert) {
        tracks = [];
        itemTrack = {
            _id: '_id',
            defaulttrack: true,
            default: true,
            file: 'file',
            kind: 'kind',
            label: 'label',
            name: 'name',
            language: 'language'
        };
        prop = 'label';
        func = 'createLabel';
        count = 0;

        expect(5);

        assertProperty(assert, '', 'label', 'track.label is 1st priority');
        assertProperty(assert, 'label', 'name', 'track.name is 2nd priority');
        assertProperty(assert, 'name', 'language', 'track.language is 3rd priority');
        assertProperty(assert, 'language', 'Unknown CC', 'Unknown CC is used when there is no label, name or language');
        setCount();
        assertProperty(assert, '', 'Unknown CC [5]',
            'Unknown CC [unknownTrackCount] used when there is no label, name or language and multiple tracks');
    });
});