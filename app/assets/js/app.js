(function() {
  var socket = io();
  var connected = false;
  var program = {};
  var cm;
  var vm = new Vue({
    el:"#view",
    data: {
      ready: false,
      program: {},
      scoreboard: [],
      scoreboardOpen: false,
      currentPage: 0,
      username: "",
      loading: false,
      success: false,
      successTime: 0,
      maxNumber: 0,
      fc: {},
      old: {},
      originalCode: "",
    },
    methods: {
      submitCode: function() {
        if(vm.originalCode === cm.doc.getValue().trim()) {
          console.log("empty code");
          return;
        }
        if(this.loading) return;
        this.loading = true;
        socket.emit("submission", {
          code: cm.doc.getValue(),
          programId: this.program._id,
          username: this.username,
        });
      },
      closeScoreboard: function() {
        this.scoreboardOpen = false;
      },
      getProgram: function(i) {
        $.ajax('/api/scoreboard/'+i)
        .then(function(data){
          console.log(data);
          var scores = data.scores;
          var tempProg = data.program;

          scores.sort(function(a, b) {
            return parseFloat(a.time) - parseFloat(b.time);
          });
          vm.$set(vm, 'scoreboard', scores);
          vm.currentPage = i;
          vm.old = tempProg;
        });
      },
      useOld: function() {
        initWithProgram(this.old);
        this.scoreboardOpen = false;
      },
    },
    mounted: function() {
      this.ready = true;

    }
  });

  function initWithProgram(data) {
    vm.loading =  false;
    vm.success = false;
    vm.successTime = 0;
    vm.fc = {};
    vm.$set(vm, 'program', data);
    console.log(cm);
    vm.originalCode = "def " + data.functionName + "(" + data.callSignature +"):";
    $('#code-wrap').empty();
    $('#code-wrap').append('<div id="code" class="row"></div>');
    cm = CodeMirror(document.getElementById("code"), {
      mode:  "python",
      lineNumbers: true,
      value: vm.originalCode,
    });
  }

  socket.on('problem', function(data) {
    console.log(data);
    if(!data) {
      document.body.classList.add("no-question");
      return;
    }
    if(!connected) {
      vm.maxNumber = data.number;
      vm.currentPage = data.number;

      initWithProgram(data);
      connected = true;
    }
  });

  socket.on('results', function(data, time, fc) {
    console.log(data, time, fc);
    vm.loading = false;
    vm.fc = JSON.parse(fc.trim());
    vm.successTime = ""+time;
    if(data) {
      console.log("congrats");
      vm.success = true;
    }
  });

  function showScoreboard() {
    vm.scoreboardOpen = true;
    $.ajax('/api/scoreboard/'+vm.currentPage)
    .then(function(data){

      var scores = data.scores;
      scores.sort(function(a, b) {
        return parseFloat(a.time) - parseFloat(b.time);
      });
      vm.$set(vm, 'scoreboard', scores);
    });
  }
  $('.showScore').on('click', showScoreboard);

  var modal = document.getElementById('modal');
  var submitName = document.getElementById('submit-name');
  var nameInput = document.getElementById('name-input');
  nameInput.focus();
  submitName.onclick = (e) => {
    e.preventDefault();
    modal.style.display = "none";
    vm.username = nameInput.value;
  };
})();
