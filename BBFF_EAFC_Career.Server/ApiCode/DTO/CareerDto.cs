namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class CareerDto
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateLastSaved { get; set; }
        public string LastSaved { get; set; }
        public string CurrencySymbol { get; set; }
        public string CurrentSeason { get; set; }
        public bool Completed { get; set; }
    }
}
