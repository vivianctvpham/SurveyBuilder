import React from "react";
// import logger from "sabio-debug";
import PropTypes from "prop-types";
import { Formik, Form, Field, FieldArray } from "formik";
import surveyBuilderSchema from "./surveyBuilderSchema";
import { Button } from "reactstrap";

// const _logger = logger.extend("SurveyQuestion");

class SurveyQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      surveyQuestion: {
        question: "",
        helpText: "",
        isRequired: "",
        isMultipleAllowed: "",
        statusId: 0,
        questionTypeId: 0,
        sortOrder: 1
      }
    };
  }

  localQuestionDelete = e => {
    e.preventDefault();
    this.props.handleDeleteQuestion(this.props.tempQuestionId);
  };

  render() {
    return (
      <>
        <Formik
          enableReinitialize
          validationSchema={surveyBuilderSchema.addQuestion}
          initialValues={this.props.value}
          isInitialValid={this.state.isEditing}
        >
          {props => {
            const { values, errors, touched, setFieldValue, isValid } = props;
            if (isValid) {
              this.props.saveQuestionData({
                ...values,
                tempQuestionId: this.props.tempQuestionId
              });
            }
            return (
              <div className="col-md-12">
                <div className="border card card-body border-warning">
                  <Form>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>
                          <h6>Question {this.props.tempQuestionId}</h6>
                        </label>
                        <Button
                          color="danger"
                          className="btn-sm qDelete"
                          onClick={this.localQuestionDelete}
                        >
                          <i className="fas fa-times" />
                        </Button>
                        <Field
                          name="question"
                          type="text"
                          value={values.question}
                          className={
                            errors.question && touched.question
                              ? "form-control error"
                              : "form-control"
                          }
                          placeholder="Question"
                        />
                        {errors.question && touched.question && (
                          <span className="input-feedback">*Required</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Help Text</label>
                        <Field
                          name="helpText"
                          type="text"
                          value={values.helpText}
                          className={
                            errors.helpText && touched.helpText
                              ? "form-control error"
                              : "form-control"
                          }
                          placeholder="A block of help text that identifies specific
                                    properties."
                        />
                        {errors.helpText && touched.helpText && (
                          <span className="input-feedback">*Required</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Is Question Required?</label>
                        <Field
                          className={
                            errors.isRequired && touched.isRequired
                              ? "form-control error"
                              : "form-control"
                          }
                          as="select"
                          name="isRequired"
                          component="select"
                          value={values.isRequired}
                        >
                          <option value={""}>Choose here...</option>
                          <option value={true}>Yes</option>
                          <option value={false}>No</option>
                        </Field>
                        {errors.isRequired && touched.isRequired && (
                          <span className="input-feedback">*Required</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label className="">Is Multiple Allowed?</label>
                        <Field
                          className={
                            errors.isMultipleAllowed &&
                            touched.isMultipleAllowed
                              ? "form-control error"
                              : "form-control"
                          }
                          as="select"
                          name="isMultipleAllowed"
                          component="select"
                          value={values.isMultipleAllowed}
                        >
                          <option value={""}>Choose here...</option>
                          <option value={true}>Yes</option>
                          <option value={false}>No</option>
                        </Field>
                        {errors.isMultipleAllowed &&
                          touched.isMultipleAllowed && (
                            <span className="input-feedback">*Required</span>
                          )}
                      </div>
                      <div className="form-group">
                        <label className="">Select Question Status</label>
                        <Field
                          className={
                            errors.statusId && touched.statusId
                              ? "form-control error"
                              : "form-control"
                          }
                          as="select"
                          name="statusId"
                          component="select"
                          value={values.statusId}
                          onChange={e => {
                            setFieldValue("statusId", parseInt(e.target.value));
                          }}
                        >
                          <option value={""}>Choose here...</option>
                          {this.props.mappedStatus}
                        </Field>
                        {errors.statusId && touched.statusId && (
                          <span className="input-feedback">*Required</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label className="">Select Question Type</label>
                        <Field
                          className={
                            errors.questionTypeId && touched.questionTypeId
                              ? "form-control error"
                              : "form-control"
                          }
                          as="select"
                          name="questionTypeId"
                          component="select"
                          value={values.questionTypeId}
                          onChange={e => {
                            setFieldValue(
                              "questionTypeId",
                              parseInt(e.target.value)
                            );
                          }}
                        >
                          <option value="">Choose here...</option>
                          {this.props.mappedQuestionTypes}
                        </Field>
                      </div>
                    </div>
                    <div>
                      <FieldArray
                        name="surveyAnswerOptions"
                        render={arrayHelpers => (
                          <div>
                            <br />
                            <div className="card-title">
                              <h5>Answer Options</h5>
                            </div>
                            <Button
                              color="primary"
                              onClick={() => arrayHelpers.push("")}
                              style={{ float: "right" }}
                            >
                              <i className="fa glyphicon glyphicon-plus fa-plus" />
                              Add Answer Option
                            </Button>
                            <div className="row">
                              {values.surveyAnswerOptions.map(
                                (option, index) => (
                                  <>
                                    <div className="col-sm-4" key={index}>
                                      <Button
                                        className="answerDelete"
                                        color="danger"
                                        onClick={() =>
                                          arrayHelpers.remove(index)
                                        }
                                      >
                                        <i className="fas fa-times" />
                                      </Button>
                                      <div className="card-body">
                                        <Field
                                          type="text"
                                          name={`surveyAnswerOptions.[${index}].text`}
                                          className="form-control"
                                          placeholder="Answer Option..."
                                        />
                                        <Field
                                          type="text"
                                          name={`surveyAnswerOptions.[${index}].value`}
                                          className="form-control"
                                          placeholder="Value..."
                                        />

                                        <Field
                                          type="text"
                                          name={`surveyAnswerOptions.[${index}].additionalInfo`}
                                          className="form-control"
                                          placeholder="Additional information"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </Form>
                </div>
              </div>
            );
          }}
        </Formik>
      </>
    );
  }
}
SurveyQuestion.propTypes = {
  value: PropTypes.shape({
    question: PropTypes.string,
    helpText: PropTypes.string,
    isRequired: PropTypes.string,
    isMultipleAllowed: PropTypes.string,
    statusId: PropTypes.number,
    questionTypeId: PropTypes.number,
    sortOrder: PropTypes.number
  }),
  surveyAnswerOptions: PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.string,
    additionalInfo: PropTypes.string
  }),
  tempQuestionId: PropTypes.number,
  saveQuestionData: PropTypes.func,
  handleDeleteQuestion: PropTypes.func,
  mappedQuestionTypes: PropTypes.arrayOf(PropTypes.shape({})),
  mappedStatus: PropTypes.arrayOf(PropTypes.shape({}))
};

export default SurveyQuestion;
