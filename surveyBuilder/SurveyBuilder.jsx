import React from "react";
import logger from "sabio-debug";
import { Button, FormGroup, Label, Input } from "reactstrap";
import "./SurveyBuilder.css";
import { Formik, Field, FieldArray, Form } from "formik";
import surveryBuilderSchema from "./surveyBuilderSchema";
import getLookupTableData from "../../services/lookupTableService";
import SurveySection from "./SurveySection";
import * as surveyBuilderServices from "../../services/surveyBuilderService";
import Swal from "sweetalert2";
import FileUpload from "../file/FileUpload";
import PropTypes from "prop-types";

const _logger = logger.extend("SurveyBuilder");

class SurveyBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.sections = {};
    this.state = {
      nextButton: false,
      addSectionButton: true,
      isChecked: false,
      survey: {
        name: "",
        description: "",
        surveyTypeId: "",
        statusId: "",
        titleTypesId: "",
        primaryImageUrl: "",
        basicPlanListTypes: []
      },
      surveySection: [],
      surveyType: [],
      surveyStatus: [],
      titleType: [],
      questionType: []
    };
  }

  componentDidMount() {
    getLookupTableData("surveytypes")
      .then(this.surveyTypeSuccess)
      .catch(this.getDataError);

    getLookupTableData("surveystatus")
      .then(this.surveyStatusSuccess)
      .catch(this.getDataError);

    getLookupTableData("titles")
      .then(this.titleTypeSuccess)
      .catch(this.getDataError);

    getLookupTableData("questiontypes")
      .then(this.questionTypeSuccess)
      .catch(this.getDataError);
  }
  surveyTypeSuccess = payload => {
    let surveyTypesData = payload.res.items;
    this.setState(prevState => {
      return {
        ...prevState,
        surveyType: surveyTypesData
      };
    });
  };
  surveyStatusSuccess = payload => {
    let surveyStatusData = payload.res.items;
    this.setState(prevState => {
      return {
        ...prevState,
        surveyStatus: surveyStatusData
      };
    });
  };
  titleTypeSuccess = payload => {
    let titleType = payload.res.items;
    this.setState(prevState => {
      return {
        ...prevState,
        titleType
      };
    });
  };
  questionTypeSuccess = payload => {
    let questionType = payload.res.items;
    this.setState(prevState => {
      return {
        ...prevState,
        questionType
      };
    });
  };
  getDataError = errRes => {
    _logger("Something went wrong", errRes);
  };
  mapTypes = ({ id, name }) => (
    <option key={id} value={id}>
      {name}
    </option>
  );

  saveData = data => {
    _logger("saveData", data);
    let tempSectionId = data.tempSectionId;
    this.sections[tempSectionId] = data;
  };
  handleSubmit = (data, { resetForm }) => {
    _logger("Data handleSubmit", data);
    let payload = { ...this.sections };

    let sectionList = [];
    Object.keys(payload).forEach(section => sectionList.push(payload[section]));
    let finalSection = sectionList.map(this.mapSections);

    let questionData = [];
    for (let i = 0; i < sectionList.length; i++) {
      const questionList = sectionList[i].surveyQuestions;
      Object.keys(questionList).forEach(question =>
        questionData.push(questionList[question])
      );
    }

    let answerOption = [];
    for (let i = 0; i < questionData.length; i++) {
      const answers = questionData[i].surveyAnswerOptions;
      for (let i = 0; i < answers.length; i++) {
        const singleAnswerOption = answers[i];
        answerOption.push(singleAnswerOption);
      }
    }

    data.sections = finalSection;
    data.questions = questionData.map(this.mapQuestions);
    data.answerOptions = answerOption.map(this.mapAnswers);

    let finalData = data;

    _logger("FINALLLL", finalData);

    surveyBuilderServices
      .addNewSurvey(finalData)
      .then(this.onPostSurveySuccess)
      .catch(this.onPostSurveyError);

    resetForm(this.state.survey);
  };
  onPostSurveySuccess = res => {
    _logger("SUCCESS", res);
    Swal.fire("Success!", "Survey Created!", "success")
      .then(this.resetForm)
      .then(() => this.props.history.push(`/surveys`));
  };
  onPostSurveyError = err => {
    _logger("ERROR", err);
    Swal.fire("Oh no!", "Something went wrong!", "error");
  };
  resetForm = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        surveySection: [],
        nextButton: false,
        addSectionButton: true
      };
    });
  };
  mapSections = section => {
    let newSection = {
      tempSectionId: section.tempSectionId,
      section: section.title,
      description: section.description,
      sortOrder: section.sortOrder
    };
    return newSection;
  };
  mapQuestions = question => {
    let newQuestion = {
      tempSectionId: question.tempSectionId,
      tempQuestionId: question.tempQuestionId,
      question: question.question,
      helpText: question.helpText,
      isRequired: question.isRequired,
      isMultipleAllowed: question.isMultipleAllowed,
      statusId: question.statusId,
      questionTypeId: question.questionTypeId,
      sortOrder: question.sortOrder
    };
    return newQuestion;
  };
  mapAnswers = answer => {
    let newAnswer = {
      tempQuestionId: answer.tempQuestionId,
      tempQuestionAnswerOptionId: answer.tempQuestionAnswerOptionId,
      text: answer.text,
      value: answer.value,
      additionalInfo: answer.additionalInfo
    };
    return newAnswer;
  };
  onHandleDelete = section => {
    let index = this.state.surveySection.findIndex(
      item => item.props.tempSectionId === section
    );
    this.setState(prevState => {
      let newSection = [...prevState.surveySection];
      if (index > -1) {
        newSection.splice(index, 1);
      }
      return {
        ...prevState,
        surveySection: newSection
      };
    });
  };
  renderSurveySection = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        surveySection: prevState.surveySection.concat([
          <SurveySection
            value={{
              title: "",
              description: "",
              sortOrder: 1
            }}
            tempSectionId={prevState.surveySection.length + 1}
            key={"Section_" + prevState.surveySection.length + 1}
            saveData={this.saveData}
            handleDelete={this.onHandleDelete}
            mappedQuestionTypes={this.state.questionType.map(this.mapTypes)}
            mappedStatus={this.state.surveyStatus.map(this.mapTypes)}
          />
        ]),
        nextButton: true,
        addSectionButton: false
      };
    });
  };

  render() {
    return (
      <>
        <div className="surveyBuilderContainer">
          <Formik
            enableReinitialize
            validationSchema={surveryBuilderSchema.addSurvey}
            initialValues={this.state.survey}
            isInitialValid={this.state.isEditing}
            onSubmit={this.handleSubmit}
            render={({
              handleChange,
              values,
              errors,
              touched,
              handleSubmit,
              isValid,
              isSubmitting,
              setFieldValue
            }) => {
              return (
                <div className="col-md-12">
                  <div className="card">
                    <div className="m-0 p-3 border-bottom bg-light card-title">
                      <i className="far fa-file-alt builderTitle" />
                      Create a Survey
                    </div>
                    <div className="card-body">
                      <Form onSubmit={handleSubmit}>
                        <div className="form-group">
                          <label className="">Name</label>
                          <Field
                            type="text"
                            className={
                              errors.name && touched.name
                                ? "form-control error"
                                : "form-control"
                            }
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            placeholder="Name"
                          />
                          {errors.name && touched.name && (
                            <span className="input-feedback">
                              {errors.name}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="">Description</label>
                          <Field
                            rows="5"
                            className={
                              errors.description && touched.description
                                ? "form-control error"
                                : "form-control"
                            }
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            placeholder="Description"
                          />
                          {errors.description && touched.description && (
                            <span className="input-feedback">
                              {errors.description}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="">Select Survey Type</label>
                          <Field
                            component="select"
                            className={
                              errors.surveyTypeId && touched.surveyTypeId
                                ? "form-control error"
                                : "form-control"
                            }
                            as="select"
                            name="surveyTypeId"
                            value={
                              values.surveyTypeId ? values.surveyTypeId : ""
                            }
                            onChange={e => {
                              setFieldValue(
                                "surveyTypeId",
                                parseInt(e.target.value)
                              );
                            }}
                          >
                            <option value="">Choose here...</option>
                            {this.state.surveyType &&
                            this.state.surveyType.length > 0
                              ? this.state.surveyType.map(this.mapTypes)
                              : null}
                          </Field>
                          {errors.surveyTypeId && touched.surveyTypeId && (
                            <span className="input-feedback">
                              {errors.surveyTypeId}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="">Select Survey Status</label>
                          <Field
                            component="select"
                            className={
                              errors.statusId && touched.statusId
                                ? "form-control error"
                                : "form-control"
                            }
                            as="select"
                            name="statusId"
                            value={values.statusId ? values.statusId : ""}
                            onChange={e => {
                              setFieldValue(
                                "statusId",
                                parseInt(e.target.value)
                              );
                            }}
                          >
                            <option value="">Choose here...</option>
                            {this.state.surveyStatus &&
                            this.state.surveyStatus.length > 0
                              ? this.state.surveyStatus.map(this.mapTypes)
                              : null}
                          </Field>
                          {errors.statusId && touched.statusId && (
                            <span className="input-feedback">
                              {errors.surveyStatus}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="">Select Title Type</label>
                          <Field
                            component="select"
                            className={
                              errors.titleTypesId && touched.titleTypesId
                                ? "form-control error"
                                : "form-control"
                            }
                            as="select"
                            name="titleTypesId"
                            value={
                              values.titleTypesId ? values.titleTypesId : ""
                            }
                            onChange={e => {
                              setFieldValue(
                                "titleTypesId",
                                parseInt(e.target.value)
                              );
                            }}
                          >
                            <option value="">Choose here...</option>
                            {this.state.titleType &&
                            this.state.titleType.length > 0
                              ? this.state.titleType.map(this.mapTypes)
                              : null}
                          </Field>
                          {errors.titleTypesId && touched.titleTypesId && (
                            <span className="input-feedback">
                              {errors.titleTypesId}
                            </span>
                          )}
                        </div>
                        <FormGroup>
                          <Label>Primary Image</Label>
                          <br />
                          <FileUpload
                            value={values.primaryImageUrl}
                            onChange={image =>
                              setFieldValue("primaryImageUrl", image[0])
                            }
                          />
                        </FormGroup>
                        <FieldArray
                          name="basicPlanListTypes"
                          className={
                            errors.basicPlanListTypes &&
                            touched.basicPlanListTypes
                              ? "form-control error"
                              : "form-control"
                          }
                          render={arrayHelpers => (
                            <div>
                              <label>Plan Types Accepted:</label>
                              <FormGroup key={1} check>
                                <Label check>
                                  <Input
                                    className="checkBox"
                                    type="checkbox"
                                    onClick={() => {
                                      let index = values.basicPlanListTypes.indexOf(
                                        1
                                      );
                                      if (index < 0) {
                                        arrayHelpers.push(1);
                                      } else {
                                        arrayHelpers.remove(index);
                                      }
                                    }}
                                  />
                                  Medicare
                                </Label>
                                <br />
                                <Label check>
                                  <Input
                                    className="checkBox"
                                    type="checkbox"
                                    onClick={() => {
                                      let index = values.basicPlanListTypes.indexOf(
                                        2
                                      );
                                      if (index < 0) {
                                        arrayHelpers.push(2);
                                      } else {
                                        arrayHelpers.remove(index);
                                      }
                                    }}
                                  />
                                  Medicaid
                                </Label>
                                <br />
                                <Label check>
                                  <Input
                                    className="checkBox"
                                    type="checkbox"
                                    onClick={() => {
                                      let index = values.basicPlanListTypes.indexOf(
                                        3
                                      );
                                      if (index < 0) {
                                        arrayHelpers.push(3);
                                      } else {
                                        arrayHelpers.remove(index);
                                      }
                                    }}
                                  />
                                  Commercial
                                </Label>
                              </FormGroup>
                              {errors.basicPlanListTypes &&
                                touched.basicPlanListTypes && (
                                  <span className="input-feedback">
                                    {errors.basicPlanListTypes}
                                  </span>
                                )}
                            </div>
                          )}
                        />
                        <Button
                          className="nextButton"
                          color="info"
                          onClick={this.renderSurveySection}
                          hidden={this.state.nextButton}
                          disabled={!isValid || isSubmitting}
                        >
                          Next
                        </Button>
                        <div>{this.state.surveySection}</div>
                        <br />
                        <br />
                        {this.state.addSectionButton === false ? (
                          <>
                            <br />
                            <Button
                              color="info"
                              onClick={this.renderSurveySection}
                              hidden={this.state.addSectionButton}
                              disabled={!isValid || isSubmitting}
                            >
                              <i className="fa glyphicon glyphicon-plus fa-plus" />
                              New Section
                            </Button>
                          </>
                        ) : null}
                        <Button
                          type="submit"
                          className="btn btn-success btn btn-secondary"
                          disabled={!isValid || isSubmitting}
                        >
                          <i className="fa fa-check"></i> Submit
                        </Button>
                      </Form>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </>
    );
  }
}
SurveyBuilder.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func })
};

export default SurveyBuilder;
