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
      fc: {},
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
    },
    mounted: function() {
      this.ready = true;
    }
  });

  function initWithProgram(data) {
    vm.$set(vm, 'program', data);
    vm.originalCode = "def " + data.functionName + "(" + data.callSignature +"):";
    cm = CodeMirror(document.getElementById("code"), {
      value: vm.originalCode,
      mode:  "python",
      lineNumbers: true
    });
  }

  socket.on('problem', function(data) {
    console.log(data);
    if(!data) {
      document.body.classList.add("no-question");
      return;
    }
    if(!connected) {
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
    $.ajax('/api/scoreboard/recent')
    .then(function(data){

      var scores = data;
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
