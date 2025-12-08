//import * as React from 'react';
//import _Widget from '../src/runtime/widget';
//import _VMSManager from '../src/runtime/gdb-version-manager';
//import {wrapWidget} from 'jimu-for-test';

// setup file

describe('GDB VMS Manager', function () {
  /*
  const validUrl = 'https://dev0010161.esri.com/server/rest/services/Water_Distribution_Utility_Network_34/FeatureServer';
  const invalidUrl = 'https://services7.arcgis.com/mbo4CkTxRxNUaNGx/arcgis/rest/services/Water_Issues_1_37cd44a22a7144599214e97dc4c3cf25/FeatureServer';
  it('is A VMS', function() {
    const vms = new _VMSManager();
    expect(vms.checkValidVMS(validUrl)).resolves.toBe(true);
  });
  it('is not a VMS', function() {
    const vms = new _VMSManager();
    expect(vms.checkValidVMS(invalidUrl)).resolves.toBe(false);
  });
  */
  /*
  it('can get versions by url',  function() {
    let vms = new _VMSManager();
    let result = await vms.getVersions(null,validUrl);
    console.log(result);
    expect(result.canManage).toEqual(false);
  });
  */
})

describe('Create Version', function () {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it('name exceeded 62 character check - local', function () {
  })
})

// -----------------------> RUNTIME FUNCTIONALITY TESTS <-----------------------

/* [1] Feature: User may switch between versioned services

      As a Field Worker for a water utility,
      I want to be able to switch between versioned services,
      So I can locate other utility assets where I’m about to dig to repair a water leak.*/

describe('Switch between services', function () {
  /*
  it('Can view list of available services', function() {
    // Given multiple versioned services are configured for the widget
    // When the field worker loads the widget
    // Then a list of all the configured services is available
  });
  it('Can switch to another service', function() {
    // Given multiple versioned services are configured for the widget
    // When the field worker selects a service
    // Then the widget switches to that service and provides the list of all the versions found in that service
  });
  */
  it('Can view versions list in the service', function () {
    // Given multiple versioned are found in a service
    // When the field worker selects a service
    // Then a list of all the versions found in that service is provided
  })
  /*
  it('Can view version set to load on start', function() {
    // Given an active version is set to load on start
    // When the field worker selects a service
    // Then the active version is shown
  });*/
  it('Selected service is unavailable', function () {
    // Given a service that is not available
    // When the field worker selects the service
    // Then a message is shown stating the service is not currently avilable ??? or should the service not be listed at all?
  })
})

// <---------------------------------------->

/* [2] Feature: User may search for versions in a service

      As an Field Worker,
      I need to find a specific version,
      To review the plans of the works to be completed.*/

describe('Search versions', function () {
  it('Happy Path - Can successfully find a version', function () {
    // Given multiple versions are available in the service
    // When the engineer searches for a version
    // Then the list of versions filters to show only matching results
  })
  /*
  it('Negative case - The version cannot be found', function() {
    // Given multiple versions are available in the service
    // When the engineer searches for a version
    // Then the list of versions filters and shows a message that there are no matching results
   });
   */
})

// <---------------------------------------->

/* [3] Feature: User may switch between different versions in a service

      As an Engineer,
      I need to review a series of proposed network changes,
      To select the preferred option for a project.*/

describe('Switch versions', function () {
  /*
  it('Allowed - Switch to this version button is shown and the toggle is enabled', function() {
    // Given the widget configuration allows to switch versions
    // When the widget loads
    // Then the Switch to this version button is shown and the toggle is enabled
  });
  it('Not Allowed - Switch to version button is not shown and the toggle is disabled', function() {
    // Given the widget configuration does not allow to switch versions
    // When the widget loads
    // Then the Switch to version button is not shown and the toggle is disabled
  });
  */
  it('Happy Path - Can successfully switch to a version', function () {
    // Given the widget configuration allows to switch between versions
    // When the engineer clicks the Switch to version button
    // Then this version become the current active version
  })
})

// <---------------------------------------->

/* [4] Feature: User may view information associated to a version

      As a Supervisor,
      I need to view versions owners and last modified date,
      To review the work performed by my staff.

describe('View verion information',  function() {
  it('Field is available and hidden', function() {
    // Given the owner field is available and hidden
    // When the supervisor loads the widget
    // Then the field is not shown in the version table but can be turned on in the fields list
  });
  it('Field is available and visible', function() {
    // Given the owner field is available and visible
    // When the supervisor loads the widget
    // Then the field is shown in the version table and is turned on in the fields list
  });
  it('Field is unavailable and hidden', function() {
    // Given the modified date field is unavailable and hidden
    // When the supervisor loads the widget
    // Then the field is shown in the version table and the fields list
  });
  it('Field is unavailable and visible', function() {
    // Given the modified date field is unavailable and visible
    // When the supervisor loads the widget
    // Then the field is shown in the version table but cannot be turned on/off in the fields list
  });
  it('Only one field is visible', function() {
    // Given the owner field is the only field visible and none are available
    // When the supervisor loads the widget
    // Then the field is shown in the version table and the list icon is hidden
  });
  it('Field order changes are reflected in the version list table', function() {
    // Given the a field1 is below field2
    // When the supervisor moves field1 above field2
    // Then the field2 is shown on the left of field1 in the version table
  });
});*/

// <---------------------------------------->

/* [5] Feature: User may create a new version

      As a Planner,
      I need to create a new version,
      To be able to quickly sketch proposed assets for a network expansion.*/

describe('Create a new version', function () {
  /*
  it('Allowed - Create button is shown', function() {
    // Given the widget is configured to allow create new versions in a service
    // When the planner loads the widget
    // Then the Create New Version button is shown
  });
  it('Not allowed - Create button is not shown', function() {
    // Given the widget is configured to allow create new versions in a service
    // When the planner loads the widget
    // Then the Create New button is not shown
  });
  */
  it('Validate version is added to the service', function () {
    // Given a new version is created
    // When the planner saves the new version
    // Then the version can be found in the service
  })
})

// <---------------------------------------->

/* [6] Feature: User may not manage DEFAULT and locked versions

      As a network editor,
      I need to make edits in the network,
      To share them with staff and post to DEFAULT*/

describe('...', function () {
  /*
  it('Cannot manage DEFAULT', function() {
    // Given the version is DEFAULT
    // When the versions lists is loaded
    // Then the Manage button is hidden and the lock icon is shown
  });
  it('DEFAULT is locked', function() {
    // Given the version is DEFAULT
    // When the versions lists is loaded
    // Then the lock icon is shown against DEFAULT
  });
  */
  it('Cannot manage locked version', function () {
    // Given the version is locked
    // When the versions lists is loaded
    // Then the Manage button is hidden and the lock icon is shown
  })
  /*
  it('Lock icon is shown when version is locked', function() {
    // Given a version is locked
    // When the versions lists is loaded
    // Then a lock icon is shown against the version
  });
  */
})

// <---------------------------------------->

/* [7] Feature: User may manage an existing version

      As a supervisor,
      I need to manage existing versions,
      To change version information and privileges*/

describe('Manage existing versions', function () {
  /*
  it('Allowed - manage version button is shown', function() {
    // Given any of these capabilities are enabled: Delete existing, Update name, Update description, Change owner, Change access privileges are enabled
    // When the list of versions loads
    // Then the Update version information button is shown
  });
  it('Not Allowed - manage version button is not shown', function() {
    // Given none of these capabilities are enabled: Delete existing, Update name, Update description, Change owner, Change access privileges are enabled
    // When the list of versions loads
    // Then the Update version ifnormation button is not shown
  });
  */
  it('Validate updates made to the version', function () {
    // Given updates were made to version capabilities
    // When changes are saved
    // Then validate the changes persisted in the version
  })
})

// <---------------------------------------->

/* [8] Feature: User may delete an existing version

      As a supervisor,
      I need to delete versions,
      To cleanup outdated and unused versions in the service*/

describe('Delete a version', function () {
  /*
  it('Allowed - Delete button is shown', function() {
    // Given delete existing is allowed in the widget configuration
    // When the planner manages an existing version
    // Then the Delete button is shown
  });
// Given delete existing version is Allowed
  it('Delete a version confirmation window', function() {
    // Given managing an existing version
    // When the planner clicks delete
    // Then a delete confirmation window is shown
  });
  it('Not allowed - Delete button is not shown', function() {
    // Given delete existing is not allowed in the widget configuration
    // When the planner manages an existing version
    // Then the Delete button is not shown
  });
  */
  it('Validate version is deleted from service', function () {
    // Given clicking delete when managing an existing version
    // When the planner clicks Yes in the confirmation window
    // Then the version is deleted from the service
  })
  it('Return to DEFAULT when the active version is deleted', function () {
    // Given the active version is delete
    // When the list of versions loads in main widget pane
    // Then the DEFAULT version is active
  })
  /*
  it('Persist current active version when another version is deleted', function() {
    // Given the active version is delete
    // When the list of versions loads in main widget pane
    // Then the DEFAULT version is active
  });
  */
})

// <---------------------------------------->

/* [9] Feature: User may determine version name

      As a supervirsor,
      I need to create and update versions,
      To assign versions to different staff*/

/*
describe('Create and update version name',  function() {
  it('Create - Version name is always required', function() {
    // Given update name capability is disabled in the configuration
    // When the planner creates a new version
    // Then the version name is required
  });
  it('Create - Version name must be unique', function() {
    // Given create a new version
    // When the supervisor saves the new version
    // Then the supervirsor should be prompted to change the name if it already exist
  it('Update - Version name remains required', function() {
    // Given update name is allowed
    // When the supervisor manages an existing version
    // Then the version name is required and cannot be blank
  });
  it('Update - Version name must be unique', function() {
  // Given create a new version
  // When the supervisor saves the new version
  // Then the supervirsor should be prompted to change the name if it already exist
  });
  it('Allowed - can update version name', function() {
    // Given update name capability is allowed in the configuration
    // When the supervisor manages an existing version
    // Then the version name can be edited
  });
  it('Not Allowed - cannot update version name', function() {
    // Given update name capability is not allowed in the configuration
    // When the supervisor manages an existing version
    // Then the version name cannot be edited
  });
});
*/

describe('Create Version Name', function () {
  /*
  const vms = new _VMSManager();
  it('Name exceeded 62 character check - local', function() {
    const versionName = 'This name is over 62 character so it should return false otherwise this test will fail';
    const isValid = vms.checkValidVersionName(versionName);
    expect(isValid.success).toEqual(false);
  });
  it('name should not allow period, colon, or semicolons - local', function() {
    const versionName = 'This name has a . and a :';
    const isValid = vms.checkValidVersionName(versionName);
    expect(isValid.success).toEqual(false);
  });
  it('name should not start with a space - local', function() {
  });

  it('Name should not allow period, colon, or semicolons - local', function() {
    const versionName = 'This name has a . and a :';
    const isValid = vms.checkValidVersionName(versionName);
    expect(isValid.success).toEqual(false);
  });
  it('Name should not start with a space - local', function() {
    const versionName = ' This name starts with a space';
    const isValid = vms.checkValidVersionName(versionName);
    expect(isValid.success).toEqual(false);
  });
  it('name is valid - local', function() {
    const versionName = 'This is a valid name';
    const isValid = vms.checkValidVersionName(versionName);
    expect(isValid.success).toEqual(true);
  });
  */
})

// <---------------------------------------->

/* [10] Feature: User may determine version description

      As a supervirsor,
      I need to create and update versions,
      To assign versions to different staff

describe('Create and update version descriptions',  function() {
  it('Create - Version description is always editable', function() {
    // Given update description capability is disabled in the configuration
    // When the planner creates a new version
    // Then the version description can be edited
  });
  it('Allowed - can update version description', function() {
    // Given update description capability is allowed in the configuration
    // When the supervisor manages an existing version
    // Then the version description can be edited
  });
  it('Not Allowed - cannot update version description', function() {
    // Given update description capability is not allowed in the configuration
    // When the supervisor manages an existing version
    // Then the version description cannot be edited and is disabled
  });

  it('Description exceeded 64 character check', function() {
    // Given a description is emtered
    // When the supervisor tries to enter more than 64 characters
    // Then the excess characters cannot be typed
  });
});*/

// <---------------------------------------->

/* [11] Feature: User may view and edit a version based on its access privileges

    As a public worker,
    I need to view a map of the network,
    To know where the assets are located*/

describe('User access privileges to versions', function () {
  /*
  const public_validVMservice = ''; //public valid version management service with versions
  const protected_validVMservice = ''; //protected valid version management service with versions
  const userA = ''; //Anonymous user
  const userB = ''; //Database owner
  const userC = ''; //Database user
  const versionA = ''; //public version
  const versionB = ''; //protected version
  const versionC = ''; //private version
  */

  // Given userA
  // Given a public valid version management service with versions
  // Given versionA
  it('Public service - Anonymous user and public version', function () {
    // Given an anonymous user accesses the service with public versions
    // When list of versions is generated
    // Then public versions are listed and create + manage buttons are hidden
  })
  // Given versionB
  it('Public service - Anonymous user and protected version', function () {
    // Given an anonymous user accesses the service with protected versions
    // When list of versions is generated
    // Then protected versions are listed and create + manage buttons are hidden
  })
  // Given versionC
  it('Public service - Anonymous user and private version', function () {
    // Given an anonymous user accesses the service with private versions
    // When list of versions is generated
    // Then private versions are not listed
  })
  // Given a protected valid version management service
  it('Private service - Anonymous user ', function () {
    // Given an anonymous user accesses the protected service
    // When accessing the service endpoint
    // Then user is prompted to login to access the service
  })

  // Given a valid public or protected version management service with versions
  // Given userB
  // Given versionA
  it('Database owner and public version', function () {
    // Given a database owner accesses the service with public versions
    // When list of versions is generated
    // Then public versions are listed and create + manage buttons are shown
  })
  // Given versionB
  it('Database owner and protected version', function () {
    // Given a database owner accesses the service with protected versions
    // When list of versions is generated
    // Then protected versions are listed and create + manage buttons are shown
  })
  // Given versionC
  it('Database owner and private version', function () {
    // Given a database owner accesses the service with private versions
    // When list of versions is generated
    // Then private versions from all users are listed and create + manage buttons are shown
  })
  // Given userC
  // Given versionA
  it('Database user and public version', function () {
    // Given a database owner accesses the service with public versions
    // When list of versions is generated
    // Then public versions are listed and create + manage buttons are shown
  })
  // Given versionB
  it('Database user and protected version (owner)', function () {
    // Given a database owner accesses the service with protected versions owned by the user
    // When list of versions is generated
    // Then protected versions are listed and create + manage buttons are shown
  })
  it('Database user and protected version (not owner)', function () {
    // Given a database owner accesses the service with protected versions not owned by the user
    // When list of versions is generated
    // Then protected versions are listed and create + manage buttons are not shown
  })
  // Given versionC
  it('Database user and private version (owner)', function () {
    // Given a database owner accesses the service with private versions
    // When list of versions is generated
    // Then protected versions are listed and create + manage buttons are shown
  })
  it('Database user and private version (not owner)', function () {
    // Given a database owner accesses the service with private versions
    // When list of versions is generated
    // Then protected versions are not listed
  })
})

// <---------------------------------------->

/* [12] Feature: User may determine access privileges

      As a supervirsor,
      I need to create and update versions,
      To assign versions to different staff

describe('Define and update version access privileges',  function() {
  it('Create - Allowed - can change access privileges', function() {
    // Given change access privileges capability is enabled in the configuration
    // When the supervisor manages an existing version
    // Then the version access privileges can be changed
  });
  it('Create - Not allowed - cannot change access privileges', function() {
   // Given change access privileges capability is disabled in the configuration
    // When the supervisor manages an existing version
    // Then the version access privileges cannot be changed
  });
  it('Update - Allowed - can change access privileges', function() {
    // Given change access privileges capability is enabled in the configuration
    // When the planner creates a new version
    // Then the version access privileges can be changed from the default (public)
  });
  it('Update - Not allowed - cannot change access privileges', function() {
    // Given change access privileges capability is disabled in the configuration
    // When the planner creates a new version
    // Then the version access privileges cannot be changed from the default (public)
  });
});*/

// <---------------------------------------->

/* [13] Feature: User may determine version owner

      As a supervirsor,
      I need to create and update versions,
      To assign versions to different staff

describe('Define and update version owner',  function() {
  it('Create - Allowed - can define owner', function() {
    // Given change owner capability is enabled in the configuration
    // When the planner creates a new version
    // Then the version owner can be changed
  });
  it('Create - Not allowed - cannot define owner', function() {
    // Given change owner capability is disabled in the configuration
    // When the planner creates a new version
    // Then the version owner cannot be changed
  });
  it('Update - Allowed - can update owner', function() {
    // Given change owner capability is enabled in the configuration
    // When the supervisor manages an existing version
    // Then the version owner can be changed
  });
  it('Update - Not allowed - cannot update owner', function() {
    // Given change owner capability is disabled in the configuration
    // When the supervisor manages an existing version
    // Then the version owner cannot be changed
  });
});*/

// <---------------------------------------->

/* [14] Feature: User may activate a version upon creation or update
      As an Engineer,
      I need to create or update versions and activate them,
      To perform network planning edits*/

describe('Activate this version upon creation or update', function () {
  /*
  it('Create - Allowed - can activate this version', function() {
    // Given switch verions capability is enabled in the configuration
    // When the planner creates a new version
    // Then the activte this version toggle is enabled and can be switched to yes
  });
  it('Create - Not allowed - cannot activate this version', function() {
    // Given switch verions capability is disabled in the configuration
    // When the planner creates a new version
    // Then the activte this version toggle is disabled
  });
  it('Update - Allowed - can activate this version', function() {
    // Given switch versions capability is enabled in the configuration
    // When the supervisor manages an existing version
    // Then the activte this version toggle is enabled and can be switched to yes
  });
  it('Update - Not allowed - cannot activate this version', function() {
    // Given switch versions capability is disabled in the configuration
    // When the supervisor manages an existing version
    // Then the activte this version toggle is disabled
  });
  */
  it('Activate is toggled if update active version', function () {
    // Given an active version
    // When the supervisor updates the active version
    // Then the activate this version toggle is toggle to yes
  })
})

// <---------------------------------------->

/* [15] Feature: User may cancel or save changes
      As an Engineer,
      I need to create versions,
      To perform network planning edits*/

describe('Save or cancel new versions or changes to existing versions', function () {
  /*
  it('Create - Cancel create new version', function() {
    // Given the new version is saved in memory
    // When the planner clicks cancel
    // Then the new version is earsed from memory and return to main widget pane where version that was already active remains active
  });
  it('Create - Save new version - no switch', function() {
    // Given switch to this version is not allowed (toggle disabled)
    // When the planner clicks save
    // Then the new version is created and the version that was already active remains active
  });
  */
  it('Create - Save new version - switch to it', function () {
    // Given switch to this version is allowed (toggle enabled to 'yes')
    // When the planner clicks save
    // Then the new version is created and the new version is now active
  })
  /*
  it('Update - Cancel manage version erases changes', function() {
    // Given the changes to the existing version are saved in memory
    // When the supervisor clicks cancel
    // Then the changes are erased from memory and return to main widget pane where version that was already active remains active
  });
  it('Update - Save changes to existing version - no switch', function() {
    // Given switch to this version is not allowed (toggle disabled)
    // When the planner clicks save
    // Then the changes are saved and the version that was already active remains active
  });
  */
  it('Update - Save changes to existing version - switch to it', function () {
    // Given switch to this version is allowed (toggle enabled to 'yes')
    // When the planner clicks save
    // Then changes are saved and the updated version is now active
  })
})

// -----------------------> CONFIGURATION FUNCTIONALITY TESTS <-----------------------

/* [1] Feature: User may use a valid version management service

      As a GIS Analyst,
      I need to configure an application,
      To manage versions in a branch versioned service*/

describe('GDB VMS Manager', function () {
  /*
  //A valid version management service URL
  const validUrl = 'https://dev0010161.esri.com/server/rest/services/Water_Distribution_Utility_Network_34/FeatureServer';
  //An invalid version management service URL
  const invalidUrl = 'https://services7.arcgis.com/mbo4CkTxRxNUaNGx/arcgis/rest/services/Water_Issues_1_37cd44a22a7144599214e97dc4c3cf25/FeatureServer';
  // Given is a valid version management service
  it('is A VMS', function() {
    // When the service is added as a data source
    const vms = new _VMSManager();
    // Then the service can be used in the widget
    expect(vms.checkValidVMS(validUrl)).resolves.toBe(true);
  });
  // Given is not a valid version management service
  it('is not a VMS', function() {
    // When the service is added as a data source
    const vms = new _VMSManager();
    // Then an error message is shown that this service is not supported
    expect(vms.checkValidVMS(invalidUrl)).resolves.toBe(false);
  });
  it('VMS is already added', function() {
    // Given a valid version management service
    // When the service is added as a data source
    // Then a message is shown tht this service already exists in the data sources
  });
  */
})

// <---------------------------------------->

/* [2] Feature: User may choose between a basic or advanced arrangement style

      As a GIS Analyst,
      I need to configure a simple application,
      To allow engineers to switch between versions of a planned project*/

describe('Basic and Advanced arrangement styles', function () {
  /*
  it('Basic - Expand versions list shown', function() {
    // Given the basic arrangement is selected
    // When data is selected
    // Then the 'Expand versions list' parameter is shown
  });
  it('Basic - Version information not shown', function() {
    // Given the basic arrangement is selected
    // When data is selected
    // Then the 'Version information' parameters are not shown
  });
  it('Basic - Version management capability not shown', function() {
    // Given the basic arrangement is selected
    // When data is selected
    // Then the 'Version anagement capability' parameters are not shown
  });
  it('Advanced - Expand versions list not shown', function() {
    // Given the advanced arrangement is selected
    // When data is selected
    // Then the 'Expand versions list' parameter is not shown
  });
  it('Advanced - Version information shown', function() {
    // Given the advanced arrangement is selected
    // When data is selected
    // Then the 'Version information' parameters are shown
  });
  it('Advanced - Version management capability shown', function() {
    // Given the advanced arrangement is selected
    // When data is selected
    // Then the 'Version anagement capability' parameters are shown
  });
  */
  it('Advanced settings are disabled when switching to Basic', function () {
    // Given the advanced arrangement is configured
    // When arrangement is changed to basic
    // Then the settings for advanced are disabled and hidden when the widget is rendered
  })
  it('Persist settings when swiching between Advanced and Basic', function () {
    // Given the advanced arrangement is configured
    // When arrangement is changed to basic
    // Then the settings for advanced are preserved if the user switches back to advanced
  })
})

// <---------------------------------------->

/* [3] Feature: User may define number of versions listed per page

      As a GIS Analyst,
      I need to configure the BVM widget,
      To show only a limited number of versions per page*/

describe('Number of versions listed per page', function () {
  /*
  it('Keep setting when switching between arrangements', function() {
    // Given the advanced arrangement is configured
    // When arrangement is changed to basic
    // Then the number set for Records per page is kept to the user-defined value
  });
  */
  /*
  // Check that the appropriate number of versions is returned with the configuration
  it('Number of versions listed with configuration', function() {
    const config = {
      versionConfig: {
        services:[],
        arrangement:'simple',
        pageCounter:5
      }
    };
    const Widget = wrapWidget(_Widget, {
      config: config,
      manifest: {name: 'gdb-version-management'} as any,
      messages: {},
    });
    const wrapper = shallow(<Widget/>).shallow();
    expect(wrapper.find('.gdb-version-management').length).toEqual(1);
  });

  // Check that the appropriate number of versions is returned without the configuration
  it('Number of versions listed without configuration', function() {
    const Widget = wrapWidget(_Widget, {
      manifest: {name: 'gdb-version-management'} as any,
      messages: {},
    });
    const wrapper = shallow(<Widget/>).shallow();
    expect(wrapper.find('.gdb-version-management').length).toEqual(1);
  });
  */
})

// <---------------------------------------->

/* [4] Feature: User may search and select a version to load on start from the list of versions in the service

      As a Supervisor,
      I need to select a version to load on start for my application,
      So my staff can work on that specific version*/

describe('Seach and select versions in the service', function () {
  it('Get full list of versions user can access as Database owner', function () {
    // Given a valid version management service
    // When the service is added as a data source
    // Then list of all versions in the service is provided
  })
  it('Get full list of versions user can access as Database user', function () {
    // Given a valid version management service
    // When the service is added as a data source
    // Then list of public and proetcted versions in the service is provided
  })
  it('Version no longer exists - revert to DEFAULT', function () {
    // Given a version is set to load on start
    // When the version is deleted from the service
    // Then the vwidgets reverts to loading DEFAULT on start
  })
  it('Search for a version', function () {
    // Given a list of the versions available in a version management service
    // When the GIS Analyst types in the search
    // Then list of versions is filtered to show only matching results
  })
  /*
  it('Select a version', function() {
    // Given a list of the versions available in a version management service
    // When the GIS Analyst selects a version
    // Then the version persists in the selection
  });*/
})

// <---------------------------------------->

/* [5] Feature: // User may allow version management capabilities

      As a Supervisor,
      I need to manage versions,
      To create and update versions for a project*/

describe('Enable and disable version management capabilities', function () {
  it('Toggle off when not allowed', function () {
    // Given a valid version management service
    // When a capability is not allowed
    // Then the toggle is off
  })
  it('Toggle on when allowed', function () {
    // Given a valid version management service
    // When a capability is allowed
    // Then the toggle is on
  })
  /*
  it('Allow all toggles all on', function() {
    // Given a valid version management service
    // When Allow All is toggled on
    // Then all capabilities are toggled on
  });
  it('Automatically refresh version list hidden when off', function() {
    // Given a valid version management service
    // When Automatically refresh version list is toggled off
    // Then the text input for minutes is hidden
  });
  */
  it('Automatically refresh version list text input integers', function () {
    // Given a valid version management service
    // When Automatically refresh version list is toggled on
    // Then the text input only allows for integers
  })
})

// <---------------------------------------->

/* [6] Feature: User may show or hide version information

      As a Supervisor,
      I need to view versions owners and last modified date,
      To review the work performed by my staff.

describe('Version information fields order',  function() {
  it('At least one field must be shown', function() {
    // Given an advanced arrangement style is selected
    // When all checkboxes for Show are disabled
    // Then at least one checkbox is disabled and remains checked
  });
  it('Changing order in the list reflects in widget versions list', function() {
    // Given an advanced arrangement style is selected
    // When reordering version information fields in the configuration
    // Then order is reflected in the widget versions list
  });
});*/

// <---------------------------------------->
