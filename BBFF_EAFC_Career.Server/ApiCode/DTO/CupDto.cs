namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class CupDto
    {
        public int ID { get; set; }
        public Nullable<int> Year { get; set; }
        public string CountryCode { get; set; }
        public string CupName { get; set; }
        public string CupProgress { get; set; }
        public int NumberOfGames { get; set; }
        public bool Compulsory { get; set; }
        public Nullable<bool> Out { get; set; }
    }
}
