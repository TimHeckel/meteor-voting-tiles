Questions = new Meteor.Collection("questions");

if (Meteor.isClient) {

    Session.set("selectedTags", "");
    Meteor.subscribe("questions");

    Template.tiles.helpers({
        "alertType": function () {
            if (this.voteCount > 10) {
                return "alert-success";
            } else if (this.voteCount > 5) {
                return "alert-info";
            } else if (this.voteCount > 2) {
                return "alert-warning";
            } else {
                return "alert-error";
            }
        }
    });

    Template.tiles.questions = function () {
        var _tags = Session.get("selectedTags");
        if (_tags.length > 0) {
            return Questions.find({ tags: { $in: _tags.split(',') } }, { sort: { voteCount: -1} });
        } else {
            return Questions.find({}, { sort: { voteCount: -1} });
        }
    };

    Template.rightNav.tags = function () {
        return _.uniq(_.flatten(_.pluck(Questions.find({}).fetch(), "tags")));
    };

    Template.rightNav.events({
        "click #btn-add-question": function (e) {
            var _question = $("#question").val();
            if (_question === "") {
                bootbox.alert("Sorry, you need a question.");
            } else {
                var _tags = $("#tags").val().split(',');
                Questions.insert({ question: _question, tags: _tags, voteCount: 0 });
            }
        },
        "click .question-tag": function (e) {
            $(e.target).toggleClass("selected-tag badge-info badge-warning");
            var _tags = $(".selected-tag").map(function () { return $(this).data("value"); }).get().join(',');
            Session.set("selectedTags", _tags);
        }
    });

    Template.tiles.events({
        "click .question": function (e) {
            var _quest = this;
            $('#questionModal').html(Template.modal(_quest)).modal();
            $(".btn-answer").click(function () {
                Questions.update(_quest._id, { $set: { answer: $("#txtAnswer").val()} });
                $("#questionModal").modal("hide");
            });
        },
        "click .vote-up": function (e) {
            e.stopImmediatePropagation();
            var _cnt = this.voteCount;
            Questions.update(this._id, { $set: { voteCount: _cnt + 1} });
        },
        "click .vote-down": function (e) {
            e.stopImmediatePropagation();
            var _cnt = this.voteCount, _idx = this._id;
            if (_cnt === 0) {
                bootbox.confirm("You're gonna destroy this question! Are you sure?", function (result) {
                    result && Questions.remove({ _id: _idx });
                });
            } else {
                Questions.update(_idx, { $set: { voteCount: _cnt - 1} });
            }
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });

    Meteor.publish("questions", function (_tags) {
        return Questions.find({});
    });
};
