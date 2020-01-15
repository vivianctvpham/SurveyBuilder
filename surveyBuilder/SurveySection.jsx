import React from "react";
import { Field, Form, Formik } from "formik";
import { Button } from "reactstrap";
import logger from "sabio-debug";
import surveryBuilderSchema from "./surveyBuilderSchema";
import PropTypes from "prop-types";
import SurveyQuestion from "./SurveyQuestion";

const _logger = logger.extend("SurveySection");

class SurveySection extends React.Component {
  constructor(props) {
    super(props);
    this.surveyQuestion = {};
    this.state = {
      isEditing: false,
      sections: {
        title: "",
        description: "",
        sortOrder: 1
      },
      questionButton: false,
      addQuestionButton: true,
      questions: []
    };
  }

  addNewQuestion = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        questions: prevState.questions.concat([
          <SurveyQuestion
            key={"Question_" + prevState.questions.length + 1}
            value={{
              question: "",
              helpText: "",
              isRequired: "",
              isMultipleAllowed: "",
              statusId: 0,
              questionTypeId: 0,
              sortOrder: 1,
              surveyAnswerOptions: []
            }}
            tempQuestionId={prevState.questions.length + 1}
            saveQuestionData={this.saveQuestionData}
            handleDeleteQuestion={this.onQuestionDelete}
            mappedQuestionTypes={this.props.mappedQuestionTypes}
            mappedStatus={this.props.mappedStatus}
          />
        ]),
        questionButton: true,
        addQuestionButton: false
      };
    });
  };
  saveQuestionData = data => {
    _logger("test", data);
    let tempQuestionId = data.tempQuestionId;
    let tempSectionId = this.props.tempSectionId;
    data.tempSectionId = tempSectionId;

    let answerArray = data.surveyAnswerOptions.map((option, index) => {
      let newFormatOption = {
        tempQuestionId: tempQuestionId,
        tempQuestionAnswerOptionId: index + 1,
        text: option.text,
        value: option.value,
        additionalInfo: option.additionalInfo
      };
      return newFormatOption;
    });
    data.surveyAnswerOptions = answerArray;

    this.surveyQuestion[tempQuestionId] = data;
  };
  onLocalDeleteSection = () => {
    this.props.handleDelete(this.props.tempSectionId);
  };
  onQuestionDelete = question => {
    _logger(question);
    let index = this.state.questions.findIndex(
      item => item.props.tempQuestionId === question
    );
    this.setState(prevState => {
      let newQuestion = [...prevState.questions];

      if (index > -1) {
        newQuestion.splice(index, 1);
      }
      return {
        ...prevState,
        questions: newQuestion
      };
    });
  };

  render() {
    return (
      <>
        <div>
          <hr />
          <br />
          <div className="card-title">
            <h5>
              <Button
                color="danger"
                className="btn-sm delete"
                onClick={this.onLocalDeleteSection}
              >
                <i className="fas fa-times" />
              </Button>
              Survey Section {this.props.tempSectionId}{" "}
            </h5>
          </div>
          <Formik
            enableReinitialize
            validationSchema={surveryBuilderSchema.addSection}
            initialValues={this.props.value}
          >
            {props => {
              const { values, errors, touched, handleChange, isValid } = props;
              if (isValid) {
                this.props.saveData({
                  ...values,
                  surveyQuestions: this.surveyQuestion,
                  tempSectionId: this.props.tempSectionId
                });
              }

              return (
                <div className="col-md-12">
                  <div className="card-body">
                    <Form>
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Title</label>
                          <Field
                            name="title"
                            type="text"
                            className={
                              errors.title && touched.title
                                ? "form-control error"
                                : "form-control"
                            }
                            placeholder="Title"
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <Field
                            component="textarea"
                            rows="5"
                            name="description"
                            type="text"
                            className={
                              errors.description && touched.description
                                ? "form-control error"
                                : "form-control"
                            }
                            placeholder="Description..."
                          />
                        </div>
                      </div>
                      <Button
                        className="addQuestionButton"
                        color="warning"
                        onClick={this.addNewQuestion}
                        hidden={this.state.questionButton}
                      >
                        <i className="fa glyphicon glyphicon-plus fa-plus" />
                        Add a Question!
                      </Button>
                      <div>{this.state.questions}</div>
                      {this.state.addQuestionButton === false ? (
                        <Button
                          className="addQuestionButton"
                          color="warning"
                          onClick={this.addNewQuestion}
                          hidden={this.state.addQuestionButton}
                        >
                          <i className="fa glyphicon glyphicon-plus fa-plus" />
                          Add a Question
                        </Button>
                      ) : null}
                    </Form>
                  </div>
                </div>
              );
            }}
          </Formik>
        </div>
      </>
    );
  }
}

SurveySection.propTypes = {
  value: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    sortOrder: PropTypes.number
  }),
  tempSectionId: PropTypes.number,
  saveData: PropTypes.func,
  handleDelete: PropTypes.func,
  mappedQuestionTypes: PropTypes.arrayOf(PropTypes.shape({})),
  mappedStatus: PropTypes.arrayOf(PropTypes.shape({}))
};

export default SurveySection;
