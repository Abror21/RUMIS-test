// FIXME: Update this configuration file based on your project information

export const AppConfig = {
  site_name: 'rumis',
  title: 'RUMIS',
  description: '',
  locale: 'en',
  takeLimit: 10,
  tokenInterval: 8
};

// TODO: types is not being used 
export const types = [
  {
    label: "Valsts",
    value: "Country"
  },
  {
    label: "Vadoša iestāde",
    value: "Supervisor"
  },
  {
    label: "Izglītības iestāde",
    value: "EducationalInstitution"
  },
]

export const permissions = {
  applicationView: 'application.view',
  applicationEdit: 'application.edit',
  classifierView: 'classifier.view',
  classifierEdit: 'classifier.edit',
  documentTemplateView: 'document_template.view',
  documentTemplateEdit: 'document_template.edit',
  parameterView: 'parameter.view',
  parameterEdit: 'parameter.edit',
  resourceView: 'resource.view',
  resourceEdit: 'resource.edit',
  textTemplateView: 'text_template.view',
  textTemplateEdit: 'text_template.edit',
  userView: 'user.view',
  userEdit: 'user.edit',
  userProfileView: 'user_profile.view',
  userProfileEdit: 'user_profile.edit',
  educationalInstitutionView: 'educational_institution.view',
  educationalInstitutionEdit: 'educational_institution.edit',
  roleView: 'role.view',
  roleEdit: 'role.edit',
  logView: 'log.view',
  logEdit: 'log.edit',
  reportView: 'report.view',
  userPersonView: 'user_person.view',
  userPersonEdit: 'user_person.edit',
  viisServicesView: 'viis_services.view',
  supervisorView: "supervisor.view",
  supervisorEdit: "supervisor.edit",
  applicationResourceEdit: "application_resource.edit",
  applicationResourceReassign: "application_resource.reassign",
  applicationResourceView: "application_resource.view",
  personDataReportView: "person_data_report.view",
};

export const format: string = 'HH:mm';
export const dateFormat: string = 'DD.MM.YYYY';
export const reverseDateFormat: string = 'YYYY-MM-DD';
export const dateFilterFormat: string = 'YYYY-MM-DDTHH:mm:ss';
export const dateApplicationFormat: string = 'DD.MM.YYYY HH:mm';
export const mmDdYyFormat: string = 'MM.DD.YYYY';
export const dateRequestFormat: string = 'YYYY/MM/DD';
export const datePickerFormat: string = 'DD/MM/YYYY';
export const dateApplicationDynamicFormat: string = 'DD.MM';

export const pnaStatuses = [
  {code: 'stolen', color: 'red'},
  {code: 'preparing', color: '#D9D9D9'},
  {code: 'returned', color: 'pink'},
  {code: 'issued', color: 'green'},
  {code: 'lost', color: 'gold'},
  {code: 'prepared', color: 'blue'},
  {code: 'cancelled', color: 'yellow'}
]
export const resourceStatuses = [
  {code: 'new', color: 'blue'},
  {code: 'under_repair', color: '#D9D9D9'},
  {code: 'lost', color: 'purple'},
  {code: 'in_use', color: 'lime'},
  {code: 'stolen', color: 'red'},
  {code: 'damaged', color: 'red'},
  {code: 'available', color: 'green'},
  {code: 'reserved', color: 'gold'},
  {code: 'permanently_damaged', color: 'cyan'},
  {code: 'needs_repair', color: 'yellow'},
  {code: 'reserved', color: 'yellow'},
]

export const resourceLocations = [
  {code: 'user', color: 'blue'},
  {code: 'service', color: 'yellow'},
  {code: 'classroom', color: 'purple'},
  {code: 'library', color: 'lime'},
  {code: 'warehouse', color: 'cyan'},
]