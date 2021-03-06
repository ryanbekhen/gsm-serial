export interface IMessage {
  id: string; // Index
  stat: string; // Status
  oa: string; // Originator address
  alpha: string; // Originator name (if available in the phonebook)
  scts: string; // Service Center Time Stamp
  data: string; // The content of the text message
}
