/**
 * The mapping of base component names to their part keys.
 */
export interface ComponentNameToPartKey {
    /**
     * The part keys for the AdvancedSelect component.
     */
    AdvancedSelect: 'root' | 'button' | 'list' | 'listContent';
    /**
     * The part keys for the Alert component.
     */
    Alert: 'root' | 'icon' | 'action' | 'message' | 'button' | 'tooltip';
    /**
     * The part keys for the AlertPopup component.
     */
    AlertPopup: 'root' | 'content' | 'icon' | 'title' | 'message' | 'action' | 'option';
    /**
     * The part keys for the Badge component.
     */
    Badge: 'root' | 'badge';
    /**
     * The part keys for the Button component.
     */
    Button: 'root' | 'icon';
    /**
     * The part keys for the ButtonGroup component.
     */
    ButtonGroup: 'root';
    /**
     * The part keys for the Checkbox component.
     */
    Checkbox: 'root' | 'icon';
    /**
     * The part keys for the Card component.
     */
    Card: 'root' | 'checkmark';
    /**
     * The part keys for the CardHeader component.
     */
    CardHeader: 'root';
    /**
     * The part keys for the CardBody component.
     */
    CardBody: 'root';
    /**
     * The part keys for the CardFooter component.
     */
    CardFooter: 'root';
    /**
     * The part keys for the Collapse component.
     */
    Collapse: 'root' | 'wrapper';
    /**
     * The part keys for the CollapsablePanel component.
     */
    CollapsablePanel: 'root' | 'header';
    /**
     * The part keys for the CollapsableCheckbox component.
     */
    CollapsableCheckbox: 'root' | 'header';
    /**
     * The part keys for the CollapsableRadio component.
     */
    CollapsableRadio: 'root' | 'header';
    /**
     * The part keys for the CollapsableToggle component.
     */
    CollapsableToggle: 'root' | 'header';
    /**
     * The part keys for the ConfirmDialog component.
     */
    ConfirmDialog: 'root';
    /**
     * The part keys for the CssBaseline component.
     */
    CssBaseline: 'root';
    /**
     * The part keys for the Drawer component.
     */
    Drawer: 'root' | 'docked' | 'paper';
    /**
     * The part keys for the Dropdown component.
     */
    Dropdown: 'root';
    /**
     * The part keys for the DropdownMenu component.
     */
    DropdownMenu: 'root' | 'panel';
    /**
     * The part keys for the DropdownItem component.
     */
    DropdownItem: 'root' | 'check';
    /**
     * The part keys for the DropdownButton component.
     */
    DropdownButton: 'root' | 'content' | 'caret';
    /**
     * The part keys for the FloatingPanel component.
     */
    FloatingPanel: 'root' | 'header' | 'content';
    /**
     * The part keys for the Icon component.
     */
    Icon: 'root' | 'img';
    /**
     * The part keys for the Image component.
     */
    Image: 'root';
    /**
     * The part keys for the Label component.
     */
    Label: 'root';
    /**
     * The part keys for the Link component.
     */
    Link: 'root';
    /**
     * The part keys for the ListGroupItem component.
     */
    ListGroupItem: 'root';
    /**
     * The part keys for the Loading component.
     */
    Loading: 'root';
    /**
     * The part keys for the Message component.
     */
    Message: 'root' | 'content' | 'icon';
    /**
     * The part keys for the MobilePanel component.
     */
    MobilePanel: 'root';
    /**
     * The part keys for the Modal component.
     */
    Modal: 'root';
    /**
     * The part keys for the MultiRangeSlider component.
     */
    MultiRangeSlider: 'root' | 'slider' | 'tooltip';
    /**
     * The part keys for the MultiSelect component.
     */
    MultiSelect: 'root' | 'button' | 'list';
    /**
     * The part keys for the MultiSelectItem component.
     */
    MultiSelectItem: 'root';
    /**
     * The part keys for the Nav component.
     */
    Nav: 'root';
    /**
     * The part keys for the Navbar component.
     */
    Navbar: 'root';
    /**
     * The part keys for the NavButtonGroup component.
     */
    NavButtonGroup: 'root';
    /**
     * The part keys for the NavItem component.
     */
    NavItem: 'root';
    /**
     * The part keys for the NavMenu component.
     */
    NavMenu: 'root' | 'dropdown' | 'collapse';
    /**
     * The part keys for the NavLink component.
     */
    NavLink: 'root' | 'wrapper';
    /**
     * The part keys for the Notification component.
     */
    Notification: 'root' | 'content' | 'message' | 'description' | 'action';
    /**
     * The part keys for the NumericInput component.
     */
    NumericInput: 'root';
    /**
     * The part keys for the Option component.
     */
    Option: 'root';
    /**
     * The part keys for the Pagination component.
     */
    Pagination: 'root' | 'page-list' | 'page-select' | 'page-jumper';
    /**
     * The part keys for the PageNumber component.
     */
    PageNumber: 'root';
    /**
     * The part keys for the Paper component.
     */
    Paper: 'root';
    /**
     * The part keys for the Progress component.
     */
    Progress: 'root';
    /**
     * The part keys for the Popper component.
     */
    Popper: 'root' | 'arrow';
    /**
     * The part keys for the Radio component.
     */
    Radio: 'root' | 'pointer';
    /**
     * The part keys for the Resizable component.
     */
    Resizable: 'root' | 'resizer';
    /**
     * The part keys for the Scrollable component.
     */
    Scrollable: 'root';
    /**
     * The part keys for the ScrollList component.
     */
    ScrollList: 'root' | 'list';
    /**
     * The part keys for the Select component.
     */
    Select: 'root' | 'button' | 'list';
    /**
     * The part keys for the Slider component.
     */
    Slider: 'root' | 'wrapper' | 'tooltip';
    /**
     * The part keys for the Surface component.
     */
    Surface: 'root';
    /**
     * The part keys for the SVG component.
     */
    SVG: 'root';
    /**
     * The part keys for the Switch component.
     */
    Switch: 'root' | 'slider';
    /**
     * The part keys for the Tab component.
     */
    Tab: 'root' | 'action';
    /**
     * The part keys for the Tabs component.
     */
    Tabs: 'root';
    /**
     * The part keys for the TagInput component.
     */
    TagInput: 'root';
    /**
     * The part keys for the TextArea component.
     */
    TextArea: 'root';
    /**
     * The part keys for the TextInput component.
     */
    TextInput: 'root';
    /**
     * The part keys for the Tooltip component.
     */
    Tooltip: 'root' | 'button';
}
