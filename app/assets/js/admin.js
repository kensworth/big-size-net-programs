(function() {
  var program = {
    title: "",
    desc: "",
    releaseDate: "",
    defaultCode: "",
    timeout: 100,
  };
  var testCases = [];
  var intMaker = function(n) {
    var ret = n;
    if(!isNaN(parseFloat(n)) && isFinite(n)) {
      ret = parseFloat(n);
    } else {
      ret = n.replace(/^"(.*)"$/, '$1');
    }
    return ret;
  };

  var vm = new Vue({
    el:"#view",
    data: {
      newTestCase: {
        input: "",
        expected: ""
      },
      program: program,
      testCases: testCases
    },
    methods: {
      addTestCase: function() {
        var _newTestCase = this.newTestCase;
        var _input = {};
        _newTestCase.input.split("\n").map(function(line) {
          _input[line.split("=")[0]] = intMaker(line.split('=').slice(1).join('='));
        });
        _newTestCase.input = _input;
        _newTestCase.expected = intMaker(_newTestCase.expected);
        testCases.push(_newTestCase);
        this.newTestCase =  {
          input: "",
          expected: ""
        };
      },
      submit: function() {
        console.log("submit", this.program);

        this.program.releaseDate = new Date().getTime();

        this.program.testCases = testCases;
        $.ajax({
          method: "POST",
          url: "admin/add-program",
          data: {
            data: JSON.stringify(this.program)
          }
        })
        .done(function( msg ) {
          console.log( "Data Saved: " + msg );
          this.program = {
            title: "",
            desc: "",
            releaseDate: "",
            defaultCode: "",
            timeout: 100,
          };
          this.testCases = [];
        });
      }
    },
    mounted: function() {
      $('.clockpicker').clockpicker();
    }
  });
})();
