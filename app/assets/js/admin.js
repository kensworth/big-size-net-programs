(function() {
  var program = {
    title: "",
    desc: "",
    releaseDate: "",
    defaultCode: "",
    timeout: 100,
  };
  var testCases = [];
  var vm = new Vue({
    el:"#view",
    data: {
      newTestCase: {
        input: "",
        inputType: "str",
        output: "",
        outputType: "str",
      },
      program: program,
      testCases: testCases,
      types: [
        "str",
        "int",
        "float",
      ]
    },
    methods: {
      addTestCase: function() {
        testCases.push(this.newTestCase);
        this.newTestCase =  {
          input: "",
          inputType: "str",
          output: "",
          outputType: "str",
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
        });
      }
    },
    mounted: function() {
      $('.clockpicker').clockpicker();
    }
  });
})();
