import * as Yup from "yup";

const surveyBuilderSchema = {
  addSurvey: Yup.object().shape({
    name: Yup.string().required("*Required"),
    description: Yup.string()
      .min(10, "Must be 10 characters or more.")
      .max(2000, "Must be 2000 characters or less.")
      .required("*Required"),
    surveyTypeId: Yup.number().required("*Required."),
    statusId: Yup.number().required("*Required"),
    titleTypesId: Yup.number().required("*Required"),
    primaryImageUrl: Yup.string(),
    basicPlanListTypes: Yup.array().required("*Required")
  }),

  addSection: Yup.object().shape({
    title: Yup.string()
      .max(100, "Must be 100 characters or less.")
      .required(),
    description: Yup.string()
      .min(10, "Must be 10 characters or more.")
      .max(1000, "Must be 1000 characters or less.")
      .required(),
    sortOrder: Yup.number().required("*Required")
  }),

  addQuestion: Yup.object().shape({
    question: Yup.string()
      .max(500, "Must be 500 characters or less.")
      .required("*Required"),
    helpText: Yup.string()
      .max(255, "Must be 255 characters or less")
      .required("*Required"),
    isRequired: Yup.bool().required("*Required"),
    isMultipleAllowed: Yup.bool().required("*Required"),
    questionTypeId: Yup.number().required("*Required"),
    statusId: Yup.number().required("Required"),
    sortOrder: Yup.number().required("*Required"),
    surveyAnswerOptions: Yup.array()
      .of(
        Yup.object().shape({
          text: Yup.string().max(500, "Must be 500 characters or less."),
          value: Yup.string().max(100, "Must be 100 characters or less."),
          additionalInfo: Yup.string().max(
            200,
            "Must be 200 characters or less."
          )
        })
      )
      .min(2, "Please create at lease 2 answer options.")
      .required("*Required")
  })
};

export default surveyBuilderSchema;
